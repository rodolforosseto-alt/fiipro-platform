import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 300;

const API_BASE = "https://api.usebolsai.com/api/v1";
const PAGE_SIZE = 500;
const INSERT_CHUNK = 100;
const MIN_EXPECTED_FUNDS = 50;
const TICKER = /^[A-Z]{4}\d{2}$/;

type ApiListItem = { ticker?: unknown; name?: unknown; total_shareholders?: unknown };

const SMALL_WORDS = new Set(["de", "da", "do", "das", "dos", "e", "em"]);
const NOISE: RegExp[] = [
  /\bDE RESPONSABILIDADE LIMITADA\b/gi,
  /\bRESPONSABILIDADE LIMITADA\b/gi,
  /\bRESP\.? LIMITADA\b/gi,
  /\bFUNDO DE INVESTIMENTO IMOBILI[ÁA]RIO\b/gi,
  /\s-\s*IMOBILI[ÁA]RIO\b/gi,
  /\bFII\b/gi,
  /\bRL\b/gi,
];

/**
 * Nome "bonito" a partir do nome registrado na CVM (em maiúsculas, com sufixos jurídicos).
 * Melhor esforço: a prévia da rota mostra o resultado antes de gravar qualquer coisa.
 */
function cleanFundName(raw: string): string {
  const original = raw.replace(/\s+/g, " ").trim();
  let s = original;
  for (const re of NOISE) s = s.replace(re, " ");
  s = s.replace(/\s+/g, " ").replace(/[\s-]+$/, "").trim();
  if (!s) s = original;

  return s
    .split(" ")
    .map((word, index) => {
      const lower = word.toLocaleLowerCase("pt-BR");
      if (index > 0 && SMALL_WORDS.has(lower)) return lower;
      if (word.length <= 3 && word === word.toLocaleUpperCase("pt-BR")) return word;
      if (word === word.toLocaleUpperCase("pt-BR") || word === lower) {
        return lower.charAt(0).toLocaleUpperCase("pt-BR") + lower.slice(1);
      }
      return word;
    })
    .join(" ");
}

function intOrNull(value: unknown): number | null {
  const n = Number(value);
  return value !== null && value !== undefined && value !== "" && Number.isFinite(n) ? Math.round(n) : null;
}

/**
 * Cadastra na tabela `fundos` os FIIs que a UseBolsaAI lista e ainda não existem aqui.
 * - Sem parâmetros: só mostra a prévia (não grava nada).
 * - `?confirmar=1`: grava. Opcionais: `ativo=0` (entram desativados) e `limite=N` (só os N primeiros).
 * Nunca altera nem apaga fundos existentes.
 */
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

  const params = request.nextUrl.searchParams;
  const confirm = params.get("confirmar") === "1";
  const active = params.get("ativo") !== "0";
  const limitParam = Number(params.get("limite"));
  const limit = Number.isInteger(limitParam) && limitParam > 0 ? limitParam : null;

  const sb = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const startedAtMs = Date.now();
  let auditId: string | null = null;

  try {
    // 1) Lista da API (uma chamada, sem paginação)
    const response = await fetch(`${API_BASE}/fiis/`, {
      headers: { "X-API-Key": apiKey, Accept: "application/json" },
      signal: AbortSignal.timeout(30000), cache: "no-store",
    });
    if (!response.ok) throw new Error(`UseBolsaAI HTTP ${response.status}: ${(await response.text()).slice(0, 180)}`);
    const body = (await response.json()) as { fiis?: ApiListItem[] };
    const list = Array.isArray(body.fiis) ? body.fiis : [];
    if (list.length < MIN_EXPECTED_FUNDS) {
      throw new Error(`Lista da API com ${list.length} fundos; esperado pelo menos ${MIN_EXPECTED_FUNDS}. Nada foi gravado.`);
    }

    // 2) Fundos já cadastrados (ativos e desativados)
    const existing = new Set<string>();
    for (let offset = 0; ; offset += PAGE_SIZE) {
      const { data, error } = await sb.from("fundos").select("ticker").order("ticker").range(offset, offset + PAGE_SIZE - 1);
      if (error) throw new Error(error.message);
      for (const row of data ?? []) existing.add(String(row.ticker).toUpperCase());
      if (!data || data.length < PAGE_SIZE) break;
    }

    // 3) O que falta
    const apiTickers = new Set<string>();
    const invalid: Array<{ ticker: unknown; name: unknown }> = [];
    const missing: Array<{ ticker: string; name_api: string; nome: string; numero_cotistas: number | null }> = [];
    for (const item of list) {
      const ticker = typeof item.ticker === "string" ? item.ticker.trim().toUpperCase() : "";
      const name = typeof item.name === "string" ? item.name : "";
      if (!TICKER.test(ticker) || !name.trim()) { invalid.push({ ticker: item.ticker, name: item.name }); continue; }
      apiTickers.add(ticker);
      if (!existing.has(ticker)) {
        missing.push({ ticker, name_api: name, nome: cleanFundName(name), numero_cotistas: intOrNull(item.total_shareholders) });
      }
    }
    const notInApi = [...existing].filter((t) => !apiTickers.has(t)).sort();
    const toInsert = limit ? missing.slice(0, limit) : missing;

    const summary = {
      api_total: list.length, ja_cadastrados: existing.size, novos: missing.length,
      invalidos: invalid.length, cadastrados_ausentes_na_api: notInApi,
    };

    if (!confirm) {
      return NextResponse.json({
        mode: "preview", ...summary,
        aviso: "Nada foi gravado. Para cadastrar, chame de novo com ?confirmar=1 (opcionais: &ativo=0, &limite=N).",
        novos_lista: missing, invalidos_lista: invalid.slice(0, 50),
      });
    }

    // 4) Gravação (com auditoria)
    const { data: importRow, error: auditError } = await sb.from("importacoes")
      .insert({ tipo: "fundos", arquivo_nome: "vercel_cron_usebolsai", status: "processando", mensagem: `Início ${new Date(startedAtMs).toISOString()}` })
      .select("id").single();
    if (auditError || !importRow) throw new Error(auditError?.message ?? "Falha ao iniciar auditoria");
    auditId = importRow.id;

    let inserted = 0;
    for (let i = 0; i < toInsert.length; i += INSERT_CHUNK) {
      const rows = toInsert.slice(i, i + INSERT_CHUNK).map((f) => ({
        ticker: f.ticker, nome: f.nome, ativo: active, numero_cotistas: f.numero_cotistas, fonte_dados: "UseBolsaAI",
      }));
      const { data, error } = await sb.from("fundos").upsert(rows, { onConflict: "ticker", ignoreDuplicates: true }).select("ticker");
      if (error) throw new Error(`Cadastro de fundos: ${error.message}`);
      inserted += data?.length ?? 0;
    }

    const durationMs = Date.now() - startedAtMs;
    const message = JSON.stringify({ ...summary, inseridos: inserted, ativo: active, limite: limit });
    const { error } = await sb.from("importacoes").update({
      status: "concluido", quantidade_registros: list.length, registros_processados: toInsert.length,
      registros_novos: inserted, registros_duplicados: existing.size, duracao_ms: durationMs,
      mensagem: message, finalizado_em: new Date().toISOString(),
    }).eq("id", auditId);
    if (error) throw new Error(`Falha ao finalizar auditoria: ${error.message}`);

    return NextResponse.json({ mode: "confirmed", status: "success", duration_ms: durationMs, ...summary, inseridos: inserted, ativo: active });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (auditId) {
      await sb.from("importacoes").update({ status: "erro", mensagem: message, finalizado_em: new Date().toISOString() }).eq("id", auditId);
    }
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
