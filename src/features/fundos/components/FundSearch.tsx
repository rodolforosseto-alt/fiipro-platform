"use client";


import { useState } from "react";

import Link from "next/link";

import { searchFundosAutocomplete } from "../services/fundos.service";

import { FundoSearchResult } from "../types/fundo-search";


interface Props {

  onSearch:(term:string)=>void;

}



export function FundSearch({
  onSearch
}:Props){


const [term,setTerm] =
useState("");


const [sugestoes,setSugestoes] =
useState<FundoSearchResult[]>([]);



async function handleChange(
value:string
){

setTerm(value);


if(value.length < 2){

setSugestoes([]);

return;

}


const result =
await searchFundosAutocomplete(value);


setSugestoes(result);

}



function handleSearch(){

onSearch(term);

setSugestoes([]);

}



return (

<div className="relative w-full">


<div className="flex gap-3">


<input

className="w-full rounded-lg border p-3"

placeholder="Digite o ticker ou nome do fundo"

value={term}

onChange={(e)=>
handleChange(e.target.value)
}

/>



<button

className="rounded-lg bg-blue-600 px-5 text-white"

onClick={handleSearch}

>

Buscar

</button>


</div>



{
sugestoes.length > 0 && (

    

<div className="
absolute
z-50
mt-2
w-full
overflow-hidden
rounded-lg
border
bg-white
shadow-lg
">


{
sugestoes.map((fundo)=>(


<Link

key={fundo.id}

href={`/fundos/${fundo.ticker}`}

className="
block
border-b
p-4
hover:bg-gray-50
"

onClick={()=>{

setSugestoes([]);

setTerm("");

}}

>


<div className="font-bold text-gray-900">

{fundo.ticker}

</div>


<div className="text-gray-600">

{fundo.nome}

</div>


<div className="text-sm text-blue-600">

{fundo.segmento}

</div>


</Link>


))

}


</div>

)

}

{
  term.length >= 2 &&
  sugestoes.length === 0 && (

    <div className="
      absolute
      z-50
      mt-2
      w-full
      rounded-lg
      border
      bg-white
      p-4
      text-gray-500
      shadow-lg
    ">

      Nenhum fundo encontrado.

    </div>

  )
}



</div>

);

}

