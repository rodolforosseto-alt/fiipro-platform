import { MetricCard } from "@/components/finance/MetricCard";


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


<MetricCard

title="Cotação"

value={`R$ ${cotacao.toFixed(2)}`}

description="Preço atual da cota"

/>


<MetricCard

title="Dividendo"

value={`R$ ${dividendo.toFixed(2)}`}

description="Último rendimento"

/>


<MetricCard

title="DY mensal"

value={`${dy}%`}

description="Dividend Yield"

/>


</div>

)

}