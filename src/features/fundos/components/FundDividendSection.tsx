import { DividendSummary }
from "@/features/dividendos/components/DividendSummary";

import { DividendChart }
from "@/features/dividendos/components/DividendChart";

import { DividendHistory }
from "@/features/dividendos/components/DividendHistory";

import { Dividendo }
from "@/features/dividendos/types/dividendo";


interface Props {

dividendos: Dividendo[];

}


export function FundDividendSection({
dividendos
}:Props){


return (

<section className="mt-10">


<h2 className="mb-5 text-2xl font-bold">

Dividendos

</h2>


<DividendSummary
dividendos={dividendos}
/>


<DividendChart
dividendos={dividendos}
/>


<DividendHistory
dividendos={dividendos}
/>


</section>

)

}