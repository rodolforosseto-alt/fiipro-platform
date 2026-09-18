interface FundCardProps {
  ticker: string;
  nome: string;
  segmento: string;
  cotacao: number;
  ultimo_dividendo: number;
  dy_mensal: number;
}


export function FundCard({
  ticker,
  nome,
  segmento,
  cotacao,
  ultimo_dividendo,
  dy_mensal,
}: FundCardProps) {

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">

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
            R$ {cotacao.toFixed(2)}
          </p>
        </div>


        <div>
          <p className="text-sm text-gray-500">
            Último dividendo
          </p>

          <p className="text-lg font-semibold text-green-600">
            R$ {ultimo_dividendo.toFixed(2)}
          </p>
        </div>


        <div>
          <p className="text-sm text-gray-500">
            DY mensal
          </p>

          <p className="text-lg font-semibold">
            {dy_mensal}%
          </p>
        </div>

      </div>

    </div>
  );
}