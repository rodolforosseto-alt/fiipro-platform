import { getFundoByTicker } from "@/features/fundos/services/fundos.service";

import { getDividendosByFundo } from "@/features/dividendos/services/dividendos.service";

import { FundHeader } from "@/features/fundos/components/FundHeader";

import { FundActions } from "@/features/fundos/components/FundActions";

import { notFound } from "next/navigation";

import { MetricCard } from "@/components/finance/MetricCard";

import { FundInformation } from "@/features/fundos/components/FundInformation";

import { FundDividendAverage }
from "@/features/fundos/components/FundDividendAverage";

import { getCotacoesByFundo }
from "@/features/cotacoes/services/cotacoes.service";

import { FundOverview }
from "@/features/fundos/components/FundOverview";


import { FundDividendSection }
from "@/features/fundos/components/FundDividendSection";


import { FundMarketSection }
from "@/features/fundos/components/FundMarketSection";

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

if (!fundo) {
  notFound();
}

const dividendos =
await getDividendosByFundo(fundo.id);

const cotacoes =
await getCotacoesByFundo(fundo.id);

console.log(
"Cotações carregadas:",
cotacoes
);

return (

<main className="p-8">


<FundHeader

ticker={fundo.ticker}

nome={fundo.nome}

segmento={fundo.segmento}

/>



<FundOverview

cotacao={fundo.cotacao}

dividendo={fundo.ultimo_dividendo}

dy={fundo.dy_mensal}

dividendos={dividendos}

cotacoes={cotacoes}

/>



<FundDividendSection

dividendos={dividendos}

/>



<FundMarketSection

cotacoes={cotacoes}

/>



<FundInformation

gestor={fundo.gestor}

descricao={fundo.descricao}

patrimonio={fundo.patrimonio}

numero_cotistas={fundo.numero_cotistas}

/>



<FundActions

ticker={fundo.ticker}

/>


</main>

)

}