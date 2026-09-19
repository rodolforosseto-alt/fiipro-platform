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

<h1 className="text-5xl font-black text-black">
{ticker}
</h1>


<h2 className="mt-2 text-xl font-semibold text-gray-700">
{nome}
</h2>


<span className="text-blue-600">
{segmento}
</span>

</div>

)

}