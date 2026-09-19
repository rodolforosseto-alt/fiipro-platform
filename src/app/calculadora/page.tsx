import Link from "next/link";

import { getFundoByTicker } from "@/features/fundos/services/fundos.service";

import { CalculatorForm } from "@/features/calculadora/components/CalculatorForm";


interface Props {

  searchParams: Promise<{
    fundo?: string;
  }>;

}


export default async function CalculadoraPage({
  searchParams,
}: Props) {

  const params = await searchParams;

  const ticker = params.fundo;


  if (!ticker) {

    return (

      <main className="p-8">

        <h1 className="text-4xl font-bold">
          Calculadora Bola de Neve
        </h1>

        <p className="mt-3 text-gray-600">
          Escolha primeiro um fundo imobiliário
          para realizar a simulação.
        </p>

        <Link
          href="/fundos"
          className="mt-6 inline-block rounded-lg bg-blue-600 px-5 py-3 text-white"
        >
          Escolher um fundo
        </Link>

      </main>

    );
  }


  const fundo =
    await getFundoByTicker(ticker);


  if (!fundo) {

    return (

      <main className="p-8">

        <h1 className="text-3xl font-bold">
          Fundo não encontrado
        </h1>

        <Link
          href="/fundos"
          className="mt-6 inline-block text-blue-600"
        >
          Voltar para fundos
        </Link>

      </main>

    );
  }


  return (

    <main className="mx-auto max-w-5xl p-8">

      <h1 className="text-4xl font-bold">
        Calculadora Bola de Neve
      </h1>

      <p className="mt-3 text-gray-600">
        Descubra quando seus dividendos passam
        a equivaler ao valor de novas cotas.
      </p>


      <div className="mt-8">

        <CalculatorForm
          ticker={fundo.ticker}
          cotacao={Number(fundo.cotacao)}
          dividendo={Number(
            fundo.ultimo_dividendo
          )}
        />

      </div>

    </main>

  );

}