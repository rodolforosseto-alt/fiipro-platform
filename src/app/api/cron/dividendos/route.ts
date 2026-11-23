import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

const API_BASE = "https://api.usebolsai.com/api/v1";
const SOURCE = "UseBolsaAI";
const CONCURRENCY = 8;
const PAGE_SIZE = 1000;

type DbClient = SupabaseClient<any, "public", "public", any, any>;
type Fund = { id: string; ticker: string };
type FundCounts = { api: number; inserted: number; updated: number; unchanged: number; review: number; undated: number; invalid: number };
type FundResult = { ticker: string; status: "OK" } & FundCounts & { reviews: Array<Record<string, unknown>> };
type Payment = {
  payment_date?: string | null;
  record_date?: string | null;
  value_per_share?: number | string | null;
};
type ApiPayload = { ticker?: string; payments?: Payment[] };
type DividendRow = {
  id: string;
  fundo_id: string;
  data_pagamento: string;
  data_corte: string | null;
  valor: number | string;
  fonte_dados: string | null;
};

function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

function normalizeDate(value: unknown): string | null {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  if (value.startsWith("9999-") || value.startsWith("0000-")) return null;
  const d = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(d.getTime()) ? null : value;
}

function normalizeValue(value: unknown): string | null {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n.toFixed(8);
}

function dateOneYearAgo(date: Date): string {
  const copy = new Date(date);
  copy.setUTCFullYear(copy.getUTCFullYear() - 1);
  return copy.toISOString().slice(0, 10);
}

async function mapLimit<T>(
  items: T[],
  limit: number,
  worker: (item: T) => Promise<void>,
) {
  let cursor = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (true) {
      const index = cursor++;
      if (index >= items.length) return;
      await worker(items[index]);
    }
  });
  await Promise.all(runners);
}

async function getApiPayments(ticker: string, apiKey: string): Promise<Payment[]> {
  const url = new URL(`${API_BASE}/fiis/${encodeURIComponent(ticker)}/distributions`);
  url.searchParams.set("years", "2");

  const response = await fetch(url, {
    headers: { "X-API-Key": apiKey, Accept: "application/json" },
    cache: "no-store",
    signal: AbortSignal.timeout(20_000),
  });

  if (!response.ok) {
    const detail = (await response.text()).slice(0, 300);
    throw new Error(`UseBolsaAI HTTP ${response.status}: ${detail}`);
  }

  const payload = (await response.json()) as ApiPayload;
  if (payload.ticker?.toUpperCase() !== ticker || !Array.isArray(payload.payments)) {
    throw new Error("Resposta da UseBolsaAI inválida ou ticker divergente.");
  }
  return payload.payments;
}

async function getAllDividendRows(
  supabase: DbClient,
  fundId: string,
  startDate: string,
  endDate: string,
): Promise<DividendRow[]> {
  const rows: DividendRow[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from("dividendos")
      .select("id,fundo_id,data_pagamento,data_corte,valor,fonte_dados")
      .eq("fundo_id", fundId)
      .gte("data_pagamento", startDate)
      .lte("data_pagamento", endDate)
      .order("data_pagamento")
      .range(from, from + PAGE_SIZE - 1);

    if (error) throw new Error(`Supabase SELECT: ${error.message}`);
    const page = (data ?? []) as DividendRow[];
    rows.push(...page);
    if (page.length < PAGE_SIZE) return rows;
  }
}

async function processFund(
  supabase: DbClient,
  fund: Fund,
  apiKey: string,
  startDate: string,
  endDate: string,
) {
  const payments = await getApiPayments(fund.ticker, apiKey);
  const dbRows = await getAllDividendRows(supabase, fund.id, startDate, endDate);

  const byEvent = new Map<string, DividendRow[]>();
  const byUnique = new Map<string, DividendRow[]>();

  for (const row of dbRows) {
    const eventKey = `${row.data_pagamento}| ${row.data_corte ?? ""}`;
    const uniqueKey = `${row.data_pagamento}|${normalizeValue(row.valor) ?? String(row.valor)}`;
    byEvent.set(eventKey, [...(byEvent.get(eventKey) ?? []), row]);
    byUnique.set(uniqueKey, [...(byUnique.get(uniqueKey) ?? []), row]);
  }

  const seenApi = new Set<string>();
  const counts = { api: 0, inserted: 0, updated: 0, unchanged: 0, review: 0, undated: 0, invalid: 0 };
  const reviews: Array<Record<string, unknown>> = [];

  for (const payment of payments) {
    const paymentDate = normalizeDate(payment.payment_date);
    if (!paymentDate) {
      counts.undated++;
      continue;
    }
    if (paymentDate < startDate || paymentDate > endDate) continue;

    const recordDate = normalizeDate(payment.record_date);
    const value = normalizeValue(payment.value_per_share);
    if (!recordDate || !value) {
      counts.invalid++;
      reviews.push({ ticker: fund.ticker, payment_date: paymentDate, record_date: payment.record_date, reason: "DATA_COM_OU_VALOR_INVALIDO" });
      continue;
    }

    const uniqueKey = `${paymentDate}|${value}`;
    if (seenApi.has(uniqueKey)) {
      counts.review++;
      reviews.push({ ticker: fund.ticker, payment_date: paymentDate, record_date: recordDate, value, reason: "COLISAO_UNIQUE_NA_API" });
      continue;
    }
    seenApi.add(uniqueKey);
    counts.api++;

    const eventKey = `${paymentDate}| ${recordDate}`;
    const eventRows = byEvent.get(eventKey) ?? [];
    const uniqueRows = byUnique.get(uniqueKey) ?? [];

    if (eventRows.length > 1) {
      counts.review++;
      reviews.push({ ticker: fund.ticker, payment_date: paymentDate, record_date: recordDate, value, reason: "EVENTO_DUPLICADO_NO_BANCO" });
      continue;
    }

    if (eventRows.length === 1) {
      const current = eventRows[0];
      const currentValue = normalizeValue(current.valor);
      const sourceAlreadyOfficial = current.fonte_dados === SOURCE;

      if (currentValue === value && sourceAlreadyOfficial) {
        counts.unchanged++;
        continue;
      }

      if (uniqueRows.some((row) => row.id !== current.id)) {
        counts.review++;
        reviews.push({ ticker: fund.ticker, payment_date: paymentDate, record_date: recordDate, value, reason: "COLISAO_UNIQUE_COM_OUTRO_EVENTO" });
        continue;
      }

      const { error } = await supabase.from("dividendos").update({
        data_corte: recordDate,
        valor: value,
        fonte_dados: SOURCE,
        ultima_atualizacao: new Date().toISOString(),
      }).eq("id", current.id);
      if (error) throw new Error(`UPDATE ${fund.ticker}: ${error.message}`);
      counts.updated++;
      continue;
    }

    if (uniqueRows.length > 0) {
      counts.review++;
      reviews.push({ ticker: fund.ticker, payment_date: paymentDate, record_date: recordDate, value, reason: "CHAVE_UNIQUE_EXISTE_PARA_OUTRO_EVENTO" });
      continue;
    }

    const { error } = await supabase.from("dividendos").insert({
      fundo_id: fund.id,
      data_pagamento: paymentDate,
      data_corte: recordDate,
      valor: value,
      fonte_dados: SOURCE,
      ultima_atualizacao: new Date().toISOString(),
    });
    if (error) throw new Error(`INSERT ${fund.ticker}: ${error.message}`);
    counts.inserted++;
  }

  return { ticker: fund.ticker, status: "OK" as const, ...counts, reviews };
}

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization");

  if (!cronSecret || authorization !== `Bearer ${cronSecret}`) {
    return json({ error: "Unauthorized" }, 401);
  }

  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const apiKey = process.env.USEBOLSAI_API_KEY;

  if (!supabaseUrl || !serviceRoleKey || !apiKey) {
    return json({ error: "Missing server environment variables." }, 500);
  }

  const startedAtMs = Date.now();
  const startedAt = new Date().toISOString();

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const now = new Date();
  const endDate = now.toISOString().slice(0, 10);
  const startDate = dateOneYearAgo(now);

  const { data: funds, error: fundsError } = await supabase
    .from("fundos")
    .select("id,ticker")
    .eq("ativo", true)
    .order("ticker");

  if (fundsError) return json({ error: fundsError.message }, 500);
  if (!funds?.length) return json({ error: "Nenhum fundo ativo encontrado." }, 409);

  const { data: importRow, error: importError } = await supabase
    .from("importacoes")
    .insert({
      tipo: "dividendos",
      arquivo_nome: "vercel_cron_usebolsai",
      status: "processando",
      created_at: startedAt,
    })
    .select("id")
    .single();

  if (importError || !importRow) {
    return json({ error: importError?.message ?? "Falha ao iniciar auditoria." }, 500);
  }

  const results: FundResult[] = [];
  const failures: Array<{ ticker: string; error: string }> = [];

  await mapLimit(funds as Fund[], CONCURRENCY, async (fund) => {
    try {
      results.push(await processFund(supabase, fund, apiKey, startDate, endDate));
    } catch (error) {
      failures.push({ ticker: fund.ticker, error: error instanceof Error ? error.message : String(error) });
    }
  });

  const totals: FundCounts = results.reduce<FundCounts>((acc, row) => {
    acc.api += row.api;
    acc.inserted += row.inserted;
    acc.updated += row.updated;
    acc.unchanged += row.unchanged;
    acc.review += row.review;
    acc.undated += row.undated;
    acc.invalid += row.invalid;
    return acc;
  }, { api: 0, inserted: 0, updated: 0, unchanged: 0, review: 0, undated: 0, invalid: 0 });

  const technicalErrors = failures.length;
  const hasReviewItems = totals.review > 0 || totals.undated > 0 || totals.invalid > 0;
  const status = technicalErrors > 0 ? "erro" : hasReviewItems ? "parcial" : "concluido";
  const finishedAt = new Date().toISOString();
  const durationMs = Date.now() - startedAtMs;
  const message = [
    `Fundos: ${funds.length}`,
    `Consultas OK: ${results.length}`,
    `Falhas: ${technicalErrors}`,
    `Novos: ${totals.inserted}`,
    `Atualizados: ${totals.updated}`,
    `Iguais: ${totals.unchanged}`,
    `Revisão: ${totals.review}`,
    `Sem data: ${totals.undated}`,
    `Inválidos: ${totals.invalid}`,
  ].join(" | ");

  const { error: finishError } = await supabase.from("importacoes").update({
    status,
    quantidade_registros: totals.api,
    registros_processados: totals.api,
    registros_novos: totals.inserted,
    registros_duplicados: totals.unchanged,
    registros_erro: technicalErrors + totals.invalid + totals.review,
    registros_atualizados: totals.updated,
    registros_sem_alteracao: totals.unchanged,
    duracao_ms: durationMs,
    mensagem: message,
    finalizado_em: finishedAt,
  }).eq("id", importRow.id);

  return json({
    status: status === "concluido" && !finishError ? "success" : "partial",
    started_at: startedAt,
    finished_at: finishedAt,
    duration_ms: durationMs,
    importacao_id: importRow.id,
    window: { start: startDate, end: endDate },
    funds: { total: funds.length, ok: results.length, failed: failures.length },
    totals,
    failures,
    reviews: results.flatMap((row) => (row.reviews as Array<Record<string, unknown>>) ?? []),
    audit_error: finishError?.message ?? null,
  }, status === "concluido" && !finishError ? 200 : 207);
}
