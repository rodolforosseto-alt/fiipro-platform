"use client";

import { useEffect, useRef, useState } from "react";

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

const [temBusca,setTemBusca] =
useState(false);

const [sugestoes,setSugestoes] =
useState<FundoSearchResult[]>([]);

const [selecionado,setSelecionado] =
useState(0);

const containerRef =
useRef<HTMLDivElement>(null);

useEffect(()=>{

function handleClickOutside(
event:PointerEvent
){

    if(
containerRef.current &&
!containerRef.current.contains(
event.target as Node
)
){

setSugestoes([]);
setTemBusca(false);

}

}


document.addEventListener(
"pointerdown",
handleClickOutside
);


return ()=>{

document.removeEventListener(
"pointerdown",
handleClickOutside
);

};


},[]);




async function handleChange(
value:string
){

setTerm(value);
setSelecionado(0);

setTemBusca(false);


if(value.length < 2){

setSugestoes([]);

return;

}




const result =
await searchFundosAutocomplete(value);


setSugestoes(result);

setTemBusca(true);

}



function handleSearch(){

onSearch(term);

setSugestoes([]);

}

function handleKeyDown(
event: React.KeyboardEvent<HTMLInputElement>
){


if(sugestoes.length === 0){

return;

}


if(event.key === "ArrowDown"){

event.preventDefault();

setSelecionado(
(prev)=>
(prev + 1) % sugestoes.length
);

}



if(event.key === "ArrowUp"){

event.preventDefault();

setSelecionado(
(prev)=>
(prev - 1 + sugestoes.length)
% sugestoes.length
);

}



if(event.key === "Enter"){

event.preventDefault();


const fundo =
sugestoes[selecionado];


if(fundo){

window.location.href =
`/fundos/${fundo.ticker}`;

}

}


}



return (

<div
ref={containerRef}
className="relative w-full"
>


<div className="flex gap-3">


<input

className="w-full rounded-lg border p-3"

placeholder="Digite o ticker ou nome do fundo"

value={term}

onChange={(e)=>
handleChange(e.target.value)
}

onKeyDown={handleKeyDown}

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
overflow-y-auto
rounded-lg
border
bg-white
shadow-lg
">


{
sugestoes.map((fundo,index)=>(


<Link

key={fundo.id}

href={`/fundos/${fundo.ticker}`}

className={`
block
border-b
p-4
${
selecionado === index
? "bg-blue-50 border-l-4 border-blue-600"
: "hover:bg-gray-50"
}
`}

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
   temBusca &&
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

