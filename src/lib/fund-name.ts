// Limpeza dos nomes de fundos vindos da CVM (maiúsculas, sufixos jurídicos, abreviações).
// Melhor esforço: o resultado deve ser revisado na prévia da rota /api/cron/fundos.

const SMALL_WORDS = new Set(["de", "da", "do", "das", "dos", "e", "em"]);

// Siglas que devem continuar em maiúsculas. Qualquer outro termo vira "Capitalizado".
const ACRONYMS = new Set([
  "XP", "BB", "BC", "BM", "RB", "AZ", "AF", "AD", "AJ", "SJ", "SP", "SC", "NM", "CX", "JS", "V2",
  "BTG", "BTGP", "RBR", "CRI", "CRA", "FOF", "FIC", "TRX", "SFI", "JGP", "LCP", "JPR", "JPP", "REC",
  "CPV", "CEO", "SPX", "HSI", "HBC", "HNS", "TFO", "USD", "CDI", "ARX", "VBI", "KSM", "DS", "FI",
  "BRB", "SAM", "SCP", "MAG", "FG", "GSFI", "JHSF", "RJDI", "IFIX",
]);
const ROMAN = /^(?:I{1,3}|IV|V|VI{1,3}|IX|X)$/;

const NOISE: RegExp[] = [
  /\bF\.I\.I\.?(?=\s|$)/gi,
  /\b(?:DE\s+)?RESP(?:ONS(?:ABILIDADE|\.)?|\.)?\s*(?:ILIMITADA|LIMITADA|LIMITADO|LIMITAD|LTDA|LIM)\b\.?/gi,
  /\bR\.\s*LIMITADA\b/gi,
  /\bFUNDO(?:\s+DE)?\s+INV(?:EST(?:IMENTO)?)?\.?\s+IMOB(?:ILI[ÁA]RI[OÓ]?S?)?\.?/gi,
  /\s-\s*IMOBILI[ÁA]RIO\b/gi,
  /\bFII\b/gi,
  /\bRL\b/gi,
  /\bLTDA\b\.?/gi,
  /\bRESP\.?(?=\s*$)/gi,
];

const PUNCTUATION_ONLY = /^[-–:.,;]+$/;

function formatSegment(segment: string, isFirst: boolean): string {
  const upper = segment.toLocaleUpperCase("pt-BR");
  const lower = segment.toLocaleLowerCase("pt-BR");
  if (segment !== upper && segment !== lower) return segment; // já veio com caixa mista
  if (!isFirst && SMALL_WORDS.has(lower)) return lower;
  if (ACRONYMS.has(upper) || ROMAN.test(upper)) return upper;
  return lower.charAt(0).toLocaleUpperCase("pt-BR") + lower.slice(1);
}

export function cleanFundName(raw: string): string {
  const original = raw.replace(/\s+/g, " ").trim();
  let text = original;
  for (const re of NOISE) text = text.replace(re, " ");

  const words = text.split(/\s+/).filter(Boolean);
  const isEdgeJunk = (w: string) => PUNCTUATION_ONLY.test(w) || SMALL_WORDS.has(w.toLocaleLowerCase("pt-BR"));
  while (words.length && isEdgeJunk(words[0])) words.shift();
  while (words.length && isEdgeJunk(words[words.length - 1])) words.pop();

  if (!words.length) return original;

  return words
    .map((word, index) =>
      word
        .split("-")
        .map((segment, i) => (segment ? formatSegment(segment, index === 0 && i === 0) : segment))
        .join("-"),
    )
    .join(" ");
}
