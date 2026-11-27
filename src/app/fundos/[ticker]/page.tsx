import { getFundoByTicker } from "@/features/fundos/services/fundos.service";

import {
  getDividendosByFundo,
  getLatestDividendosByFundo
}
from "@/features/dividendos/services/dividendos.service";

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

import { FundIndicators }
from "@/features/fundos/components/FundIndicators";


import { FundDividendSection }
from "@/features/fundos/components/FundDividendSection";


import { FundMarketSection }
from "@/features/fundos/components/FundMarketSection";

import { registrarAcessoFundo }
from "@/features/analytics/services/access.service";

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

await registrarAcessoFundo(
fundo.id,
fundo.ticker
);

const dividendos =
await getLatestDividendosByFundo(
fundo.id);

const cotacoes =
await getCotacoesByFundo(fundo.id);

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

dy12m={fundo.dy_12m}

dividendos={dividendos}

cotacoes={cotacoes}

/>



<FundIndicators

fundo={fundo}

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

tipo_fundo={fundo.tipo_fundo}

tipo_gestao={fundo.tipo_gestao}

administrador={fundo.administrador}

/>



<FundActions

ticker={fundo.ticker}

/>


</main>

)

}