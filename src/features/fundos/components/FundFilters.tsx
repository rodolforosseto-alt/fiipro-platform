"use client";


interface Props {

segmento:string;

onChange:(segmento:string)=>void;

}


const filtros = [

"Todos",

"Papel",

"Logística",

"Shopping",

"Lajes",

"Híbrido",

"Agro"

];


export function FundFilters({
segmento,
onChange
}:Props){


return (

<div className="mt-6 flex flex-wrap gap-3">


{
filtros.map((filtro)=>(

<button

key={filtro}

onClick={()=>onChange(filtro)}

className={`rounded-lg px-4 py-2 border

${segmento === filtro

? "bg-blue-600 text-white"

: "bg-white"

}

`}

>

{filtro}

</button>

))

}


</div>

)

}