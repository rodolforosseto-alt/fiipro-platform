import { Container } from "@/components/ui/Container";

const steps = [

{
title:"Escolha um fundo",
description:"Veja cotação, dividendos e informações do FII."
},

{
title:"Calcule sua evolução",
description:"Descubra o potencial dos seus dividendos."
},

{
title:"Construa sua renda",
description:"Acompanhe sua jornada de longo prazo."
}

];


export function HowItWorks(){

return (

<section className="pt-16">


<Container>


<h2 className="font-display text-5xl uppercase leading-none tracking-wide text-ink">

Como funciona

</h2>


<div className="mt-8 grid gap-6 md:grid-cols-3">

{
steps.map((step, index)=>(

<div key={step.title} className="rounded-xl border border-line p-6">

<p className="font-display text-5xl leading-none text-brand">

{index + 1}

</p>

<h3 className="mt-3 text-lg font-bold text-ink">

{step.title}

</h3>

<p className="mt-2 text-muted">

{step.description}

</p>

</div>

))
}

</div>


</Container>


</section>

)

}
