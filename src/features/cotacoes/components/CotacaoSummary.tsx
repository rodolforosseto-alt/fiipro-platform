import { Cotacao } from "../types/cotacao";

import { MetricCard } from "@/components/finance/MetricCard";


interface Props {

cotacoes:Cotacao[];

}


export function CotacaoSummary({
cotacoes
}:Props){


if(cotacoes.length === 0){

return null;

}



const ordenadas =

[...cotacoes].sort(

(a,b)=>

new Date(a.data).getTime()

-

new Date(b.data).getTime()

);



const primeira =
ordenadas[0];


const ultima =
ordenadas[ordenadas.length - 1];



const maior =

Math.max(
...cotacoes.map(
(item)=>item.valor
)
);



const menor =

Math.min(
...cotacoes.map(
(item)=>item.valor
)
);



const variacao =

((ultima.valor - primeira.valor)

/ primeira.valor)

* 100;



return (

<section className="mt-10">


<h2 className="mb-5 text-2xl font-bold">

Resumo de cotação

</h2>


<div className="grid gap-4 md:grid-cols-4">


<MetricCard

title="Cotação atual"

value={
`R$ ${ultima.valor.toFixed(2)}`
}

/>


<MetricCard

title="Maior 12 meses"

value={
`R$ ${maior.toFixed(2)}`
}

/>


<MetricCard

title="Menor 12 meses"

value={
`R$ ${menor.toFixed(2)}`
}

/>


<MetricCard

title="Variação no período"

value={
`${variacao.toFixed(2)}%`
}

/>


</div>


</section>

)

}