import Link from "next/link";


interface Props {
  ticker: string;
}


export function FundActions({
  ticker,
}: Props) {

  return (

    <div className="mt-8 flex gap-4">


      <Link
        href={`/calculadora?fundo=${encodeURIComponent(
          ticker
        )}`}
        className="rounded-lg bg-green-600 px-5 py-3 text-white"
      >
        Calcular bola de neve
      </Link>


      <button className="rounded-lg border px-5 py-3">
        Adicionar carteira
      </button>


    </div>

  );

}