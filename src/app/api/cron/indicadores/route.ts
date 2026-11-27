import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const API_BASE = "https://api.usebolsai.com/api/v1";
const PAGE_SIZE = 500;
const CONCURRENCY = 8;
const MAX_PAID_ROWS = 60;

type Fund = { id: string; ticker: string; cotacao: number | string | null };
type ApiFii = Record<string, unknown>;

function numOrNull(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}
function intOrNull(value: unknown): number | null {
  const n = numOrNull(value);
  return n === null ? null : Math.round(n);
}
function textOrNull(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const t = value.trim();
  return t ? t : null;
}
function dateOrNull(value: unknown): string | null {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const d = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== value ? null : value;
}
function round(value: number, digits: number): number {
  const f = 10 ** digits;
  return Math.round(value * f) / f;
}
async function mapLimit<T>(items: T[], limit: number, fn: (item: T) => Promise<void>) {
  let cursor = 0;
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (true) { const i = cursor++; if (i >= items.length) return; await fn(items[i]); }
  }));
}

/** Data de hoje no fuso de Brasília (AAAA-MM-DD). */
function todayBrasilia(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());
}
function oneYearBefore(isoDate: string): string {
  const d = new Date(`${isoDate}T00:00:00Z`);
  d.setUTCFullYear(d.getUTCFullYear() - 1);
  return d.toISOString().slice(0, 10);
}

/**
 * Último dividendo pago, DY do último pagamento e DY de 12 meses, a partir da tabela
 * `dividendos`. Considera só pagamentos com data_pagamento <= hoje (o "a definir",
 * 9999-12-31, nunca é gravado). Eventos na mesma data de pagamento são somados.
 */
async function dividendMetrics(sb: SupabaseClient, fundId: string, today: string, cutoff: string, price: number | null) {
  const { data, error } = await sb.from("dividendos")
    .select("valor,data_pagamento")
    .eq("fundo_id", fundId)
    .lte("data_pagamento", today)
    .order("data_pagamento", { ascending: false })
    .limit(MAX_PAID_ROWS);
  if (error) throw new Error(`Leitura de dividendos: ${error.message}`);
  const rows = (data ?? []) as Array<{ valor: number | string; data_pagamento: string }>;

  let last: number | null = null;
  if (rows.length) {
    const lastDate = rows[0].data_pagamento;
    last = rows.filter((r) => r.data_pagamento === lastDate).reduce((s, r) => s + Number(r.valor), 0);
  }
  const sum12 = rows.filter((r) => r.data_pagamento > cutoff).reduce((s, r) => s + Number(r.valor), 0);
  const hasPrice = price !== null && price > 0;
  return {
    ultimo_dividendo: last === null ? null : round(last, 8),
    dy_mensal: last !== null && hasPrice ? round((last / price) * 100, 8) : null,
    dy_12m: rows.length && hasPrice ? round((sum12 / price) * 100, 8) : null,
  };
}

function indicatorFields(api: ApiFii) {
  const composition = api.asset_composition && typeof api.asset_composition === "object" ? api.asset_composition : null;
  return {
    pvp: numOrNull(api.pvp),
    valor_patrimonial_cota: numOrNull(api.book_value_per_share),
    patrimonio: numOrNull(api.net_asset_value),
    cotas_emitidas: intOrNull(api.shares_outstanding),
    numero_cotistas: intOrNull(api.total_shareholders),
    tipo_fundo: textOrNull(api.fund_type),
    tipo_gestao: textOrNull(api.management_type),
    administrador: textOrNull(api.administrator),
    mandato: textOrNull(api.mandate),
    data_inicio: dateOrNull(api.inception_date),
    composicao_ativos: composition,
    vacancia_pct: numOrNull(api.vacancy_pct),
    inadimplencia_pct: numOrNull(api.delinquency_pct),
    percentual_locado: numOrNull(api.leased_pct),
    imoveis_qtd: intOrNull(api.property_count),
    area_total_m2: numOrNull(api.total_area_sqm),
    indicadores_referencia: dateOrNull(api.reference_date),
  };
}

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: "Não autorizado" }, { status: 401 });
  }
  const apiKey = process.env.USEBOLSAI_API_KEY;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!apiKey || !url || !serviceKey) {
    return NextResponse.json({ ok: false, error: "Variáveis de ambiente ausentes" }, { status: 500 });
  }

  const sb = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const startedAtMs = Date.now();
  const start = new Date(startedAtMs).toISOString();
  const today = todayBrasilia();
  const cutoff = oneYearBefore(today);
  const totals = { funds: 0, success: 0, indicators_updated: 0, unavailable: 0, errors: 0 };
  const failures: Array<{ ticker: string; error: string }> = [];
  const unavailable: Array<{ ticker: string; reason: string }> = [];

  const { data: importRow, error: auditError } = await sb.from("importacoes")
    .insert({ tipo: "indicadores", arquivo_nome: "vercel_cron_usebolsai", status: "processando", mensagem: `Início ${start}` })
    .select("id").single();
  if (auditError || !importRow) {
    return NextResponse.json({ ok: false, error: auditError?.message ?? "Falha ao iniciar auditoria" }, { status: 500 });
  }

  try {
    const funds: Fund[] = [];
    for (let offset = 0; ; offset += PAGE_SIZE) {
      const { data, error } = await sb.from("fundos").select("id,ticker,cotacao").eq("ativo", true).order("ticker").range(offset, offset + PAGE_SIZE - 1);
      if (error) throw new Error(error.message);
      funds.push(...((data ?? []) as Fund[]));
      if (!data || data.length < PAGE_SIZE) break;
    }
    totals.funds = funds.length;

    await mapLimit(funds, CONCURRENCY, async (fund) => {
      try {
        // 1) Indicadores da API. Ticker sem cobertura (404) não é falha técnica.
        let api: ApiFii | null = null;
        const response = await fetch(`${API_BASE}/fiis/${encodeURIComponent(fund.ticker)}`, {
          headers: { "X-API-Key": apiKey, Accept: "application/json" },
          signal: AbortSignal.timeout(18000), cache: "no-store",
        });
        if (response.status === 404) {
          unavailable.push({ ticker: fund.ticker, reason: "TICKER_NAO_COBERTO_PELA_USEBOLSAI" });
          totals.unavailable++;
        } else if (!response.ok) {
          throw new Error(`UseBolsaAI HTTP ${response.status}: ${(await response.text()).slice(0, 180)}`);
        } else {
          api = (await response.json()) as ApiFii;
          if (String(api.ticker ?? "").toUpperCase() !== fund.ticker.toUpperCase()) throw new Error("Ticker divergente nos indicadores");
        }

        // 2) Preço de referência para o DY: fechamento devolvido pela própria API; se não houver, a cotação do banco.
        const price = numOrNull(api?.close_price) ?? numOrNull(fund.cotacao);

        // 3) Dividendos pagos, sempre a partir do banco (não usa o dividend_yield_ttm da API).
        const dividends = await dividendMetrics(sb, fund.id, today, cutoff, price);

        // `ultima_atualizacao` continua sendo da cotação (rota de cotações); aqui só indicadores_atualizados_em.
        const payload: Record<string, unknown> = { ...dividends };
        if (api) {
          Object.assign(payload, indicatorFields(api), { indicadores_atualizados_em: new Date().toISOString() });
        }
        const { error } = await sb.from("fundos").update(payload).eq("id", fund.id);
        if (error) throw new Error(`Atualização do fundo: ${error.message}`);
        totals.success++;
        if (api) totals.indicators_updated++;
      } catch (error) {
        totals.errors++;
        failures.push({ ticker: fund.ticker, error: error instanceof Error ? error.message : String(error) });
      }
    });

    const end = new Date().toISOString();
    const durationMs = Date.now() - startedAtMs;
    const status = totals.errors > 0 ? "parcial" : "concluido";
    const message = JSON.stringify({ ...totals, unavailable: unavailable.slice(0, 30), failures: failures.slice(0, 30) });
    const { error } = await sb.from("importacoes").update({
      status, quantidade_registros: totals.funds, registros_processados: totals.success,
      registros_atualizados: totals.indicators_updated, registros_erro: totals.errors,
      registros_sem_alteracao: totals.unavailable, duracao_ms: durationMs, mensagem: message, finalizado_em: end,
    }).eq("id", importRow.id);
    if (error) throw new Error(`Falha ao finalizar auditoria: ${error.message}`);

    return NextResponse.json(
      { status: status === "concluido" ? "success" : "partial", startedAt: start, finishedAt: end, duration_ms: durationMs, ...totals, unavailable, failures },
      { status: status === "concluido" ? 200 : 207 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await sb.from("importacoes").update({ status: "erro", mensagem: message, finalizado_em: new Date().toISOString() }).eq("id", importRow.id);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
