import { getFundos } from "@/features/fundos/services/fundos.service";


export default async function Home(){

  const fundos = await getFundos();


  return (

    <main>

      <h1>
        FIIPro
      </h1>


      <h2>
        Fundos cadastrados
      </h2>


      {
        fundos.map((fundo)=>(
          
          <div key={fundo.id}>

            <h3>
              {fundo.ticker}
            </h3>

            <p>
              {fundo.nome}
            </p>

            <p>
              R$ {fundo.cotacao}
            </p>

          </div>

        ))
      }


    </main>

  )

}