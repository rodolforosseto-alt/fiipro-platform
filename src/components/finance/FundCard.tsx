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
    <Card>

      <div className="mb-4">
        <h2 className="text-xl font-bold">
          {ticker}
        </h2>

        <p className="text-gray-500">
          {nome}
        </p>

        <span className="text-sm text-blue-600">
          {segmento}
        </span>
      </div>


      <div className="space-y-2">

        <div>
          <p className="text-sm text-gray-500">
            Cotação
          </p>

          <p className="text-lg font-semibold">
            {cotacao != null ? `R$ ${cotacao.toFixed(2)}` : "--"}
          </p>
        </div>


        <div>
          <p className="text-sm text-gray-500">
            Último dividendo
          </p>

          <p className="text-lg font-semibold text-green-600">
            {ultimo_dividendo != null ? `R$ ${formatDividend(ultimo_dividendo)}` : "--"}
          </p>
        </div>


        <div>
          <p className="text-sm text-gray-500">
            DY mensal
          </p>

          <p className="text-lg font-semibold">
            {formatPercent(dy_mensal)}
          </p>
        </div>

        {dy_12m != null && (
          <div>
            <p className="text-sm text-gray-500">
              DY 12 meses
            </p>

            <p className="text-lg font-semibold">
              {formatPercent(dy_12m)}
            </p>
          </div>
        )}

        {pvp != null && (
          <div>
            <p className="text-sm text-gray-500">
              P/VP
            </p>

            <p className="text-lg font-semibold">
              {formatDecimal(pvp)}
            </p>
          </div>
        )}

      </div>

<Link

href={`/fundos/${ticker}`}

className="mt-5 inline-block text-blue-600 font-semibold"

>

Ver detalhes →

</Link>

    </Card>
  );
}