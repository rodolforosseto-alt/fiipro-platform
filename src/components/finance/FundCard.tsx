import { Card } from "@/components/ui/Card";
import Link from "next/link";
import { formatDecimal, formatDividend, formatPercent } from "@/lib/format";

interface FundCardProps {
  ticker: string;
  nome: string;
  segmento: string;
  cotacao: number;
  ultimo_dividendo: number;
  dy_mensal: number;
  dy_12m?: number | null;
  pvp?: number | null;
}


function Metric({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {

  return (
    <div>
      <p className="text-sm text-muted">
        {label}
      </p>

      <p className={`text-lg font-bold ${highlight ? "text-brand" : "text-ink"}`}>
        {value}
      </p>
    </div>
  );

}


export function FundCard({
  ticker,
  nome,
  segmento,
  cotacao,
  ultimo_dividendo,
  dy_mensal,
  dy_12m,
  pvp,
}: FundCardProps) {

  return (
    <Card className="flex flex-col transition hover:border-brand">

      <div className="mb-5">
        <h2 className="font-display text-4xl leading-none tracking-wide text-ink">
          {ticker}
        </h2>

        <p className="mt-1 text-muted">
          {nome}
        </p>

        {segmento && (
          <span className="mt-2 inline-block rounded-full bg-surface px-3 py-1 text-xs font-medium text-ink">
            {segmento}
          </span>
        )}
      </div>


      <div className="grid grid-cols-2 gap-4">

        <Metric
          label="Cotação"
          value={cotacao != null ? `R$ ${formatDecimal(cotacao)}` : "--"}
        />

        <Metric
          label="Último dividendo"
          value={ultimo_dividendo != null ? `R$ ${formatDividend(ultimo_dividendo)}` : "--"}
          highlight
        />

        <Metric
          label="DY mensal"
          value={formatPercent(dy_mensal)}
        />

        {dy_12m != null && (
          <Metric
            label="DY 12 meses"
            value={formatPercent(dy_12m)}
          />
        )}

        {pvp != null && (
          <Metric
            label="P/VP"
            value={formatDecimal(pvp)}
          />
        )}

      </div>

      <Link

        href={`/fundos/${ticker}`}

        className="mt-6 inline-block font-bold text-brand hover:text-brand-dark"

      >

        Ver detalhes →

      </Link>

    </Card>
  );
}
