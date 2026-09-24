import { CotacaoSummary }
from "@/features/cotacoes/components/CotacaoSummary";

import { CotacaoChart }
from "@/features/cotacoes/components/CotacaoChart";

import { Cotacao }
from "@/features/cotacoes/types/cotacao";


interface Props {

cotacoes:Cotacao[];

}


export function FundMarketSection({
cotacoes
}:Props){


return (

<section className="mt-10">


<h2 className="mb-5 text-2xl font-bold">

Mercado

</h2>



<CotacaoSummary

cotacoes={cotacoes}

/>



<CotacaoChart

cotacoes={cotacoes}

/>



</section>

)

}