"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";


import { Cotacao } from "../types/cotacao";


interface Props {

cotacoes:Cotacao[];

}



function TooltipCustom({
active,
payload,
label
}:any){


if(!active || !payload || !payload.length){

return null;

}


return (

<div className="rounded-lg border bg-white p-3 shadow">

<p className="font-semibold">

{label}

</p>


<p className="mt-1 text-blue-600">

Cotação:

R$ {payload[0].value.toFixed(2)}

</p>


</div>

)

}



export function CotacaoChart({
cotacoes
}:Props){


const hoje =
new Date();


const limite =
new Date();


limite.setFullYear(
hoje.getFullYear() - 1
);



const dados =

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

)

.map(

(item)=>({

data:

new Date(
item.data
).toLocaleDateString(
"pt-BR",
{
month:"2-digit",
year:"2-digit"
}
),

valor:item.valor

})

);



if(dados.length === 0){

return null;

}



return (

<section className="mt-10">


<h2 className="mb-5 text-2xl font-bold">

Histórico de cotação (últimos 12 meses)

</h2>


<div className="h-80 rounded-xl border p-4">


<ResponsiveContainer

width="100%"

height="100%"

>


<LineChart

data={dados}

>


<CartesianGrid

strokeDasharray="3 3"

/>


<XAxis

dataKey="data"

/>


<YAxis

domain={[
"dataMin - 0.5",
"dataMax + 0.5"
]}

tickFormatter={(valor)=>

`R$ ${valor.toFixed(2)}`

}

/>


<Tooltip

content={<TooltipCustom />}

/>


<Line

type="monotone"

dataKey="valor"

strokeWidth={3}

dot={{r:4}}

/>


</LineChart>


</ResponsiveContainer>


</div>


</section>

)

}