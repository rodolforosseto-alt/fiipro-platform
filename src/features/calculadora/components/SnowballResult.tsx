import { CalculatorResult } from "../types/calculator";


interface Props {
  result: CalculatorResult;
}


function currency(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}


export function SnowballResult({
  result,
}: Props) {

  return (

    <section className="mt-8">

      <h2 className="text-2xl font-bold">
        Sua bola de neve
      </h2>


      <div className="mt-5 grid gap-4 md:grid-cols-3">


        <div className="rounded-xl border p-5">

          <p className="text-sm text-gray-500">
            Valor atual da posição
          </p>

          <strong className="text-xl">
            {currency(result.valorPosicaoAtual)}
          </strong>

        </div>


        <div className="rounded-xl border p-5">

          <p className="text-sm text-gray-500">
            Dividendos mensais
          </p>

          <strong className="text-xl text-green-600">
            {currency(result.rendaMensal)}
          </strong>

        </div>


        <div className="rounded-xl border p-5">

          <p className="text-sm text-gray-500">
            Novas cotas inteiras
          </p>

          <strong className="text-xl">
            {result.novasCotasInteiras}
          </strong>

        </div>


      </div>


      <div className="mt-6 rounded-xl border p-6">

        <p className="text-gray-600">
          Para que os dividendos equivalham ao valor
          de uma nova cota, você precisa de aproximadamente:
        </p>

        <p className="mt-2 text-3xl font-bold text-green-600">
          {result.cotasParaUmaNovaCota} cotas
        </p>

      </div>


      <p className="mt-4 text-sm text-gray-500">
        Simulação baseada na cotação e no dividendo
        atualmente informados. Os valores podem variar.
      </p>

    </section>

  );
}