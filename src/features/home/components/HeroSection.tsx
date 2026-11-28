import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { FundAutocomplete } from "@/features/fundos/components/FundAutocomplete";


export function HeroSection(){

return (

<section className="border-b border-line">


<Container className="py-16 md:py-24">


<p className="text-sm font-medium uppercase tracking-[0.2em] text-brand">

Educação financeira · Investimentos · Renda passiva

</p>


<h1 className="mt-4 max-w-4xl font-display text-6xl uppercase leading-[0.95] tracking-wide text-ink md:text-8xl">

Invista com mais <span className="text-brand">conhecimento.</span>{" "}
Decida com mais <span className="text-brand">confiança.</span>

</h1>


<p className="mt-6 max-w-2xl text-lg text-muted md:text-xl">

Dividendos, cotações e indicadores de fundos imobiliários,
atualizados todo dia, pelo canal Rodolfo Rosseto.

</p>


<div className="mt-8 max-w-xl">

<FundAutocomplete />

</div>


<div className="mt-6 flex flex-wrap gap-3">


<Link

href="/fundos"

className="rounded-lg bg-brand px-6 py-3 font-bold text-white hover:bg-brand-dark"

>

Explorar FIIs

</Link>


<Link

href="/calculadora"

className="rounded-lg border border-line px-6 py-3 font-medium text-ink hover:border-brand hover:text-brand"

>

Simular bola de neve

</Link>


</div>


</Container>


</section>

)

}
