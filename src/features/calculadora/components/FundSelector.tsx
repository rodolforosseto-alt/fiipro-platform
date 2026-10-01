import Link from "next/link";

import { getFundos }
from "@/features/fundos/services/fundos.service";


export async function FundSelector(){


const fundos =
await getFundos();



return (

<div className="mt-8">


<h2 className="text-xl font-bold">
Escolha um fundo para simular
</h2>


<p className="mt-2 text-gray-600">
Selecione um fundo imobiliário para iniciar sua simulação.
</p>


<div className="
mt-6
grid
gap-4
md:grid-cols-3
">


{
fundos.map((fundo)=>(


<Link

key={fundo.id}

href={`/calculadora?fundo=${fundo.ticker}`}

className="
rounded-xl
border
p-5
transition
hover:border-green-500
hover:shadow-md
"

>


<h3 className="text-xl font-bold">
{fundo.ticker}
</h3>


<p className="mt-1 text-sm text-gray-600">
{fundo.nome}
</p>


<span className="mt-3 inline-block text-sm text-green-600">
Simular →
</span>


</Link>


))

}


</div>


</div>

)

}