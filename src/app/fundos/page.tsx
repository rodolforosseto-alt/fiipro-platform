import { getFundos } from "@/features/fundos/services/fundos.service";

import { FundosPageClient } from "@/features/fundos/components/FundosPageClient";

export const dynamic = "force-dynamic";

export default async function FundosPage(){


const fundos = await getFundos();



return (

<main className="p-8">


<h1 className="text-4xl font-bold">

Fundos Imobiliários

</h1>


<p className="mt-3 text-gray-600">

Encontre informações dos principais FIIs.

</p>


<div className="mt-8">

<FundosPageClient initialFundos={fundos}/>

</div>


</main>

)

}