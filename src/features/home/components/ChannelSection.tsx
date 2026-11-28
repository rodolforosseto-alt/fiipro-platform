import { Container } from "@/components/ui/Container";


export function ChannelSection(){

return (

<section className="pt-16">


<Container>


<div className="rounded-2xl border border-line bg-surface p-8 md:p-12">


<p className="text-sm font-medium uppercase tracking-[0.2em] text-brand">

No canal

</p>


<h2 className="mt-3 max-w-3xl font-display text-5xl uppercase leading-none tracking-wide text-ink">

Entenda os números com quem explica fundo imobiliário

</h2>


<p className="mt-4 max-w-2xl text-lg text-muted">

Vídeos sobre fundos imobiliários, investimentos e renda
passiva, para você investir com mais conhecimento.

</p>


<a

href="https://www.youtube.com/@RodolfoRosseto"

target="_blank"

rel="noopener noreferrer"

className="mt-8 inline-block rounded-lg bg-brand px-6 py-3 font-bold text-white hover:bg-brand-dark"

>

Inscreva-se no canal

</a>


</div>


</Container>


</section>

)

}
