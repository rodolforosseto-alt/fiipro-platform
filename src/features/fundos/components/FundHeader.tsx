import Link from "next/link";

interface Props {

ticker:string;

nome:string;

segmento:string;

}


export function FundHeader({
ticker,
nome,
segmento
}:Props){

return (

<div>

<h1 className="font-display text-7xl leading-none tracking-wide text-ink">
{ticker}
</h1>


<h2 className="mt-2 text-xl font-medium text-muted">
{nome}
</h2>


{segmento && (

<span className="mt-3 inline-block rounded-full bg-surface px-3 py-1 text-sm font-medium text-ink">
{segmento}
</span>

)}

<div className="mt-6">

<Link

href={`/calculadora?fundo=${ticker}`}

className="
inline-flex
items-center
rounded-lg
bg-brand
px-5
py-3
font-bold
text-white
transition
hover:bg-brand-dark
"

>

Simular bola de neve

</Link>

</div>

</div>

)

}
