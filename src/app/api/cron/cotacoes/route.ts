import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const API_BASE = "https://api.usebolsai.com/api/v1";
const PAGE_SIZE = 500;
const CONCURRENCY = 8;

type Fund = { id: string; ticker: string };
type Quote = { ticker?: string; trade_date?: string; close?: number | string; volume?: number; traded_amount?: number };

function dateOnly(value: unknown): string | null {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const d = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== value ? null : value;
}
function price(value: unknown): string | null {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n.toFixed(8) : null;
}
async function mapLimit<T>(items: T[], limit: number, fn: (item: T) => Promise<void>) {
  let cursor = 0;
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (true) { const i = cursor++; if (i >= items.length) return; await fn(items[i]); }
  }));
}
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ ok: false, error: "Não autorizado" }, { status: 401 });
  const apiKey = process.env.USEBOLSAI_API_KEY;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!apiKey || !url || !serviceKey) return NextResponse.json({ ok: false, error: "Variáveis de ambiente ausentes" }, { status: 500 });

  const sb = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const startedAtMs = Date.now();
  const start = new Date(startedAtMs).toISOString();
  const totals = { funds: 0, success: 0, errors: 0, inserted: 0, updated: 0, unchanged: 0, review: 0 };
  const failures: Array<{ ticker: string; error: string }> = [];
  const { data: importRow, error: auditError } = await sb.from("importacoes")
    .insert({ tipo: "cotacoes", arquivo_nome: "vercel_cron_usebolsai", status: "processando", mensagem: `Início ${start}` })
    .select("id").single();
  if (auditError || !importRow) return NextResponse.json({ ok: false, error: auditError?.message ?? "Falha ao iniciar auditoria" }, { status: 500 });

  try {
    const funds: Fund[] = [];
    for (let offset = 0; ; offset += PAGE_SIZE) {
      const { data, error } = await sb.from("fundos").select("id,ticker").eq("ativo", true).order("ticker").range(offset, offset + PAGE_SIZE - 1);
      if (error) throw new Error(error.message);
      funds.push(...((data ?? []) as Fund[]));
      if (!data || data.length < PAGE_SIZE) break;
    }
    totals.funds = funds.length;
    await mapLimit(funds, CONCURRENCY, async (fund) => {
      try {
        const response = await fetch(`${API_BASE}/stocks/${encodeURIComponent(fund.ticker)}/quote`, {
          headers: { "X-API-Key": apiKey, Accept: "application/json" },
          signal: AbortSignal.timeout(18000), cache: "no-store",
        });
        if (!response.ok) throw new Error(`UseBolsaAI HTTP ${response.status}: ${(await response.text()).slice(0, 180)}`);
        const q = await response.json() as Quote;
        if (q.ticker?.toUpperCase() !== fund.ticker.toUpperCase()) throw new Error("Ticker divergente na cotação");
        const tradeDate = dateOnly(q.trade_date);
        const close = price(q.close);
        if (!tradeDate || !close) throw new Error("Data do pregão ou fechamento inválido");

        const { data: old, error: readError } = await sb.from("cotacoes_historico")
          .select("id,valor").eq("fundo_id", fund.id).eq("data", tradeDate).maybeSingle();
        if (readError) throw new Error(`Leitura do histórico: ${readError.message}`);

        if (!old) {
          const { error } = await sb.from("cotacoes_historico").insert({ fundo_id: fund.id, data: tradeDate, valor: close });
          if (error?.code === "23505") { totals.review++; }
          else if (error) throw new Error(`INSERT: ${error.message}`);
          else totals.inserted++;
        } else if (price(old.valor) === close) {
          totals.unchanged++;
        } else {
          const { error } = await sb.from("cotacoes_historico").update({ valor: close }).eq("id", old.id);
          if (error) throw new Error(`UPDATE: ${error.message}`);
          totals.updated++;
        }

        // Atualiza a cotação corrente exibida na tabela fundos.
        const { error: fundUpdateError } = await sb.from("fundos").update({
          cotacao: close, ultima_atualizacao: new Date().toISOString(), fonte_dados: "UseBolsaAI",
        }).eq("id", fund.id);
        if (fundUpdateError) throw new Error(`Atualização do fundo: ${fundUpdateError.message}`);
        totals.success++;
      } catch (error) {
        totals.errors++;
        failures.push({ ticker: fund.ticker, error: error instanceof Error ? error.message : String(error) });
      }
    });
    const end = new Date().toISOString();
    const durationMs = Date.now() - startedAtMs;
    const status = totals.errors > 0 ? "erro" : totals.review > 0 ? "parcial" : "concluido";
    const message = JSON.stringify({ ...totals, failures: failures.slice(0, 30) });
    const { error } = await sb.from("importacoes").update({
      status, quantidade_registros: totals.funds, registros_processados: totals.success + totals.errors,
      registros_novos: totals.inserted, registros_atualizados: totals.updated,
      registros_duplicados: totals.unchanged, registros_erro: totals.errors + totals.review,
      registros_sem_alteracao: totals.unchanged, duracao_ms: durationMs,
      mensagem: message, finalizado_em: end,
    }).eq("id", importRow.id);
    if (error) throw new Error(`Falha ao finalizar auditoria: ${error.message}`);
    return NextResponse.json({ status: status === "concluido" ? "success" : "partial", startedAt: start, finishedAt: end, duration_ms: durationMs, ...totals, failures }, { status: status === "concluido" ? 200 : 207 });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await sb.from("importacoes").update({ status: "erro", mensagem: message, finalizado_em: new Date().toISOString() }).eq("id", importRow.id);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
