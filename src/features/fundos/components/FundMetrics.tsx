import { formatDecimal, formatDividend, formatPercent } from "@/lib/format";
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

value={`R$ ${formatDecimal(cotacao ?? 0)}`}

description="Preço atual da cota"

/>


<MetricCard

title="Dividendo"

value={`R$ ${formatDividend(dividendo ?? 0)}`}

description="Último rendimento"

/>


<MetricCard

title="DY mensal"

value={formatPercent(dy ?? 0)}

description="Dividend Yield"

/>


</div>

)

}