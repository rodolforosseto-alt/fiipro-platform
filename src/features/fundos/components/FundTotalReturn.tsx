import { Dividendo } from "@/features/dividendos/types/dividendo";

import { Cotacao } from "@/features/cotacoes/types/cotacao";

import { MetricCard } from "@/components/finance/MetricCard";


interface Props {

dividendos:Dividendo[];

cotacoes:Cotacao[];

}


export function FundTotalReturn({
dividendos,
cotacoes
}:Props){


if(
dividendos.length === 0 ||
cotacoes.length === 0
){

return null;

}



const hoje =
new Date();


const limite =
new Date();


limite.setFullYear(
hoje.getFullYear() - 1
);



const dividendos12Meses =

dividendos.filter(

(item)=>

new Date(item.data_pagamento) >= limite

);



const totalDividendos =

dividendos12Meses.reduce(

(soma,item)=>

soma + item.valor,

0

);



const cotacoes12Meses =

cotacoes

.filter(

(item)=>

new Date(item.data) >= limite

)

.sort(

(a,b)=>

new Date(a.data).getTime()

-

new Date(b.data).getTime()

);



const primeiraCotacao =

cotacoes12Meses[0];


const ultimaCotacao =

cotacoes12Meses[
cotacoes12Meses.length - 1
];



const variacaoCotacao =

(
(ultimaCotacao.valor -
primeiraCotacao.valor)

/ primeiraCotacao.valor

)

* 100;



const retornoTotal =

(
totalDividendos /
primeiraCotacao.valor

)

* 100

+

variacaoCotacao;



return (

<section className="mt-10">


<MetricCard

title="Retorno total últimos 12 meses"

value={
`${retornoTotal.toFixed(2)}%`
}

description="Dividendos recebidos + variação da cotação"

/>


</section>

)

}