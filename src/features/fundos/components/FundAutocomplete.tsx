"use client";


import { useState } from "react";

import Link from "next/link";

import { searchFundosAutocomplete } from "../services/fundos.service";


export function FundAutocomplete(){


const [term,setTerm] =
useState("");


const [resultados,setResultados] =
useState<any[]>([]);



async function handleChange(
value:string
){

setTerm(value);


if(value.length < 2){

setResultados([]);

return;

}


const data =
await searchFundosAutocomplete(value);


setResultados(data);

}



return (

<div className="relative w-full">


<input

value={term}

onChange={(e)=>
handleChange(e.target.value)
}

placeholder="Digite o ticker ou nome do fundo"

aria-label="Buscar fundo por ticker ou nome"

className="
w-full
rounded-lg
border
border-line
bg-white
px-4
py-3.5
text-base
text-ink
"


/>



{
resultados.length > 0 && (

<div className="
absolute
z-50
mt-2
w-full
rounded-lg
border
bg-white
shadow-lg
">


{
resultados.map((fundo)=>(


<Link

key={fundo.id}

href={`/fundos/${fundo.ticker}`}

onClick={()=>{

setResultados([]);

setTerm("");

}}

className="
block
border-b
border-line
p-4
hover:bg-surface
"

>


<p className="font-bold">

{fundo.ticker}

</p>


<p className="text-gray-600">

{fundo.nome}

</p>


<p className="text-sm text-brand">

{fundo.segmento}

</p>


</Link>


))

}


</div>

)

}


</div>

)

}