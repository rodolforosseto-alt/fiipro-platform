import { getFundos } from "@/features/fundos/services/fundos.service";
import { FundList } from "@/features/fundos/components/FundList";


export default async function Home(){

  const fundos = await getFundos();


  return (

    <main className="p-8">


      <h1 className="text-4xl font-bold">
        FIIPro
      </h1>


      <p className="mt-2">
        Transforme seus dividendos em novas cotas.
      </p>


      <h2 className="mt-10 text-2xl font-bold">
        Fundos em destaque
      </h2>


      <div className="mt-6">

        <FundList fundos={fundos}/>

      </div>


    </main>

  )

}