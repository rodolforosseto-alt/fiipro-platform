interface Props {

cotacao:number;

dividendo:number;

dy:number;

}


export function FundMetrics({
cotacao,
dividendo,
dy
}:Props){

return (

<div className="grid gap-4 md:grid-cols-3 mt-8">


<div className="border rounded-xl p-5">

<p className="text-gray-500">
Cotação
</p>

<strong>
R$ {cotacao.toFixed(2)}
</strong>

</div>



<div className="border rounded-xl p-5">

<p className="text-gray-500">
Dividendo
</p>

<strong className="text-green-600">
R$ {dividendo.toFixed(2)}
</strong>

</div>



<div className="border rounded-xl p-5">

<p className="text-gray-500">
DY mensal
</p>

<strong>
{dy}%
</strong>

</div>


</div>

)

}