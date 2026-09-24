import { FundMetrics } 
from "./FundMetrics";

import { FundYield }
from "./FundYield";

import { FundTotalReturn }
from "./FundTotalReturn";

import { Dividendo }
from "@/features/dividendos/types/dividendo";

import { Cotacao }
from "@/features/cotacoes/types/cotacao";


interface Props {

cotacao:number;

dividendo:number;

dy:number;

dividendos:Dividendo[];

cotacoes:Cotacao[];

}


export function FundOverview({
cotacao,
dividendo,
dy,
dividendos,
cotacoes
}:Props){


return (

<section className="mt-10">


<h2 className="mb-5 text-2xl font-bold">

Visão geral

</h2>


<div className="space-y-6">


<FundMetrics

cotacao={cotacao}

dividendo={dividendo}

dy={dy}

/>


<FundYield

cotacao={cotacao}

dividendos={dividendos}

/>


<FundTotalReturn

dividendos={dividendos}

cotacoes={cotacoes}

/>


</div>


</section>

)

}