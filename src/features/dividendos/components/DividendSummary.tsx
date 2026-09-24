import { Dividendo } from "../types/dividendo";


interface Props {

dividendos: Dividendo[];

}


export function DividendSummary({
dividendos
}:Props){


const hoje =
new Date();


const limite =
new Date();

limite.setFullYear(
hoje.getFullYear() - 1
);



const ultimos12Meses =

dividendos.filter(
(dividendo)=>
new Date(
dividendo.data_pagamento
) >= limite
);



const total =

ultimos12Meses.reduce(

(soma,dividendo)=>

soma + dividendo.valor,

0

);



const media =

ultimos12Meses.length > 0

?

total / ultimos12Meses.length

:

0;



const ultimo =

dividendos[0];



return (

<section className="mt-10">


<h2 className="text-2xl font-bold">

Resumo de dividendos

</h2>



<div className="mt-5 grid gap-4 md:grid-cols-3">



<div className="rounded-xl border p-5">

<p className="text-gray-500">

Último dividendo

</p>

<p className="mt-2 text-2xl font-bold">

R$ {ultimo?.valor.toFixed(2) ?? "0,00"}

</p>

</div>



<div className="rounded-xl border p-5">

<p className="text-gray-500">

Média últimos 12 meses

</p>

<p className="mt-2 text-2xl font-bold">

R$ {media.toFixed(2)}

</p>

</div>



<div className="rounded-xl border p-5">

<p className="text-gray-500">

Pagamentos últimos 12 meses

</p>

<p className="mt-2 text-2xl font-bold">

{ultimos12Meses.length}

</p>

</div>



</div>


</section>

)

}