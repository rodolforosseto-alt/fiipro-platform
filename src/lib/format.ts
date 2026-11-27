// Formatadores pt-BR. Funções puras: podem ser usadas em componentes de servidor e de cliente.

const dividendFormat = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 4,
});

/** Valor de dividendo por cota sem arredondar para 2 casas: 0,10 e 0,095 (até 4 casas). */
export function formatDividend(value: number | string | null | undefined, fallback = "--"): string {
  if (value === null || value === undefined || value === "") return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? dividendFormat.format(n) : fallback;
}

export function formatPercent(value: number | string | null | undefined, digits = 2, fallback = "--"): string {
  if (value === null || value === undefined || value === "") return fallback;
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return `${n.toLocaleString("pt-BR", { minimumFractionDigits: digits, maximumFractionDigits: digits })}%`;
}

export function formatDecimal(value: number | string | null | undefined, digits = 2, fallback = "--"): string {
  if (value === null || value === undefined || value === "") return fallback;
  const n = Number(value);
  return Number.isFinite(n)
    ? n.toLocaleString("pt-BR", { minimumFractionDigits: digits, maximumFractionDigits: digits })
    : fallback;
}

/** Compacta valores grandes: 5,2 bi, 380 mi. */
export function formatCompactMoney(value: number | string | null | undefined, fallback = "Não informado"): string {
  if (value === null || value === undefined || value === "") return fallback;
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  const abs = Math.abs(n);
  const fmt = (v: number, unit: string) => `R$ ${v.toLocaleString("pt-BR", { maximumFractionDigits: 2 })} ${unit}`;
  if (abs >= 1e9) return fmt(n / 1e9, "bi");
  if (abs >= 1e6) return fmt(n / 1e6, "mi");
  return `R$ ${n.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}`;
}

/** AAAA-MM-DD -> DD/MM/AAAA sem passar por fuso horário. */
export function formatDateBR(iso: string | null | undefined, fallback = "--"): string {
  if (!iso || !/^\d{4}-\d{2}-\d{2}/.test(iso)) return fallback;
  const [y, m, d] = iso.slice(0, 10).split("-");
  return `${d}/${m}/${y}`;
}
