import { Dividendo } from "@/features/dividendos/types/dividendo";

import { MetricCard } 
from "@/components/finance/MetricCard";

interface Props {

cotacao:number;

dividendos:Dividendo[];

}


export function FundYield({
cotacao,
dividendos
}:Props){


const hoje =
new Date();


const limite =
new Date();

limite.setFullYear(
hoje.getFullYear() - 1
);



const dividendos12Meses =

dividendos.filter(

(dividendo)=>

new Date(
dividendo.data_pagamento
) >= limite

);



const totalDividendos =

dividendos12Meses.reduce(

(soma,item)=>

soma + item.valor,

0

);



const dy =

cotacao > 0

?

(totalDividendos / cotacao) * 100

:

0;



return (

<section className="mt-10">

<MetricCard

title="Dividend Yield últimos 12 meses"

value={`${dy.toFixed(2)}%`}

description={
`Baseado em ${dividendos12Meses.length} pagamentos nos últimos 12 meses.`
}

/>

</section>

)
}