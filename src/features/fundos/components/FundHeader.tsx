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

<h1 className="text-4xl font-bold">
{ticker}
</h1>


<h2 className="text-xl text-gray-600 mt-2">
{nome}
</h2>


<span className="text-blue-600">
{segmento}
</span>

</div>

)

}