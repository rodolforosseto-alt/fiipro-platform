import { Dividendo } from "@/features/dividendos/types/dividendo";

import { MetricCard }
from "@/components/finance/MetricCard";

interface Props {

dividendos:Dividendo[];

}


export function FundDividendAverage({
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



const total =

dividendos12Meses.reduce(

(soma,item)=>

soma + item.valor,

0

);



const media =

dividendos12Meses.length > 0

?

total / dividendos12Meses.length

:

0;



return (

<section className="mt-6">

<MetricCard

title="Média mensal de dividendos"

value={
`R$ ${media.toFixed(2)}`
}

description="Média dos últimos 12 meses"

/>

</section>

);

}