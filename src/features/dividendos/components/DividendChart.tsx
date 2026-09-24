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

import { Dividendo } from "../types/dividendo";


interface Props {

dividendos: Dividendo[];

}


export function DividendChart({
dividendos
}:Props){


const hoje =
new Date();


const limite =
new Date();

limite.setFullYear(
hoje.getFullYear() - 1
);



const dados =

dividendos

.filter(

(item)=>

new Date(
item.data_pagamento
) >= limite

)

.sort(

(a,b)=>

new Date(
a.data_pagamento
).getTime()

-

new Date(
b.data_pagamento
).getTime()

)

.map(

(item)=>({

data:
new Date(
item.data_pagamento
).toLocaleDateString(
"pt-BR",
{
month:"short",
year:"2-digit"
}
),

valor:item.valor

})

);



if(dados.length === 0){

return null;

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


<p className="mt-1 text-green-600">

Dividendo:

R$ {payload[0].value.toFixed(2)}

</p>


</div>

)

}


return (

<section className="mt-10">


<h2 className="mb-5 text-2xl font-bold">

Histórico de dividendos (últimos 12 meses)

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

dot={{ r: 4 }}

/>


</LineChart>


</ResponsiveContainer>


</div>


</section>

)

}