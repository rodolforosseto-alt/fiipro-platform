import { getFundoByTicker } from "@/features/fundos/services/fundos.service";

import { FundHeader } from "@/features/fundos/components/FundHeader";

import { FundMetrics } from "@/features/fundos/components/FundMetrics";

import { FundActions } from "@/features/fundos/components/FundActions";


interface Props {

params: Promise<{
ticker:string;
}>

}


export default async function FundoPage({
params
}:Props){


const {ticker}=await params;


const fundo =
await getFundoByTicker(ticker);



return (

<main className="p-8">


<FundHeader

ticker={fundo.ticker}

nome={fundo.nome}

segmento={fundo.segmento}

/>


<FundMetrics

cotacao={fundo.cotacao}

dividendo={fundo.ultimo_dividendo}

dy={fundo.dy_mensal}

/>


<FundActions/>


</main>

)

}