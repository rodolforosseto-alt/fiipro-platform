import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { formatDecimal, formatPercent } from "@/lib/format";
import { Fundo } from "@/features/fundos/types/fundo";


// Para o ranking não ser dominado por fundos minúsculos ou em liquidação,
// só entram fundos com muitos cotistas. Ajustar aqui se o critério mudar.
const MIN_COTISTAS = 10000;

const TOP = 5;


interface Row {

ticker: string;

nome: string;

valor: string;

}


interface Props {

fundos: Fundo[];

}


function RankCard({
title,
hint,
rows
}:{
title:string;
hint:string;
rows:Row[];
}){

return (

<Card>


<h3 className="text-lg font-bold text-ink">

{title}

</h3>


<p className="mt-1 text-sm text-muted">

{hint}

</p>


<div className="mt-4">

{
rows.length === 0 ? (

<p className="border-t border-line py-4 text-sm text-muted">

Sem dados suficientes ainda.

</p>

) : (

rows.map((row)=>(

<Link

key={row.ticker}

href={`/fundos/${row.ticker}`}

className="flex items-center justify-between gap-3 border-t border-line py-3 hover:bg-surface"

>

<span>

<span className="block font-bold text-ink">

{row.ticker}

</span>

<span className="block text-sm text-muted">

{row.nome}

</span>

</span>

<span className="text-xl font-bold text-brand">

{row.valor}

</span>

</Link>

))

)
}

</div>


</Card>

)

}


export function Rankings({
fundos
}:Props){

const elegiveis = fundos.filter(
(f)=> (f.numero_cotistas ?? 0) >= MIN_COTISTAS
);


const maioresDy = elegiveis
.filter((f)=> f.dy_12m != null)
.sort((a,b)=> Number(b.dy_12m) - Number(a.dy_12m))
.slice(0,TOP)
.map((f)=>({
ticker: f.ticker,
nome: f.nome,
valor: formatPercent(f.dy_12m),
}));


const menoresPvp = elegiveis
.filter((f)=> f.pvp != null && Number(f.pvp) > 0)
.sort((a,b)=> Number(a.pvp) - Number(b.pvp))
.slice(0,TOP)
.map((f)=>({
ticker: f.ticker,
nome: f.nome,
valor: formatDecimal(f.pvp),
}));


return (

<section id="rankings" className="pt-16">


<Container>


<h2 className="font-display text-5xl uppercase leading-none tracking-wide text-ink">

Rankings do dia

</h2>


<p className="mt-3 max-w-2xl text-muted">

Pontos de partida para estudar. Consideram apenas fundos com
mais de 10 mil cotistas e não são recomendação de investimento.

</p>


<div className="mt-8 grid gap-6 md:grid-cols-2">


<RankCard

title="Maiores DY (12 meses)"

hint="Só dividendos já pagos"

rows={maioresDy}

/>


<RankCard

title="Menores P/VP"

hint="Preço sobre valor patrimonial"

rows={menoresPvp}

/>


</div>


<div className="mt-6">

<Link

href="/fundos"

className="inline-block rounded-lg border border-line px-6 py-3 font-medium text-ink hover:border-brand hover:text-brand"

>

Ver todos os fundos

</Link>

</div>


</Container>


</section>

)

}
