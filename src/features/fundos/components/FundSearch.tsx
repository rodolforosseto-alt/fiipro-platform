"use client";


import { useState } from "react";


interface Props {

onSearch:(term:string)=>void;

}


export function FundSearch({onSearch}:Props){


const [term,setTerm]=useState("");



function handleSearch(){

onSearch(term);

}



return (

<div className="flex gap-3">


<input

className="border rounded-lg p-3 w-full"

placeholder="Digite o ticker ou nome do fundo"

value={term}

onChange={(e)=>setTerm(e.target.value)}

/>


<button

className="bg-blue-600 text-white px-5 rounded-lg"

onClick={handleSearch}

>

Buscar

</button>


</div>

)

}