import { getFundoByTicker } from "@/features/fundos/services/fundos.service";


interface Props {

  params: Promise<{
    ticker:string;
  }>

}


export default async function FundoPage({
  params
}:Props){


  const { ticker } = await params;


  const fundo = await getFundoByTicker(
    ticker
  );


  return (

    <main className="p-8">

      <h1 className="text-4xl font-bold">
        {fundo.ticker}
      </h1>


      <h2 className="text-xl mt-2">
        {fundo.nome}
      </h2>


      <div className="mt-8 grid gap-4 md:grid-cols-4">


        <div className="border rounded-xl p-4">
          <p>Cotação</p>
          <strong>
            R$ {fundo.cotacao}
          </strong>
        </div>


        <div className="border rounded-xl p-4">
          <p>Dividendo</p>
          <strong>
            R$ {fundo.ultimo_dividendo}
          </strong>
        </div>


        <div className="border rounded-xl p-4">
          <p>DY mensal</p>
          <strong>
            {fundo.dy_mensal}%
          </strong>
        </div>


        <div className="border rounded-xl p-4">
          <p>Segmento</p>
          <strong>
            {fundo.segmento}
          </strong>
        </div>


      </div>

    </main>

  )

}