import { FundCard } from "@/components/finance/FundCard";
import { Fundo } from "../types/fundo";

interface FundListProps {
  fundos: Fundo[];
}

export function FundList({ fundos }: FundListProps) {

  return (
    <div className="grid gap-6 md:grid-cols-3">

      {
        fundos.map((fundo) => (

          <FundCard

            key={fundo.id}

            ticker={fundo.ticker}

            nome={fundo.nome}

            segmento={fundo.segmento}

            cotacao={fundo.cotacao}

            ultimo_dividendo={fundo.ultimo_dividendo}

            dy_mensal={fundo.dy_mensal}

          />

        ))
      }

    </div>
  );
}