import Link from "next/link";
import { Container } from "@/components/ui/Container";


export function CallToAction(){

return (

<section className="pt-16">


<Container>


<div className="rounded-2xl bg-ink p-10 text-center text-white md:p-14">


<h2 className="mx-auto max-w-3xl font-display text-5xl uppercase leading-none tracking-wide">

Explore seus fundos imobiliários com mais clareza

</h2>


<p className="mx-auto mt-4 max-w-2xl text-white/80">

Acompanhe dividendos, cotações e informações
dos FIIs em uma plataforma criada para investidores.

</p>


<div className="mt-8 flex flex-wrap justify-center gap-3">

<Link

href="/fundos"

className="rounded-lg bg-white px-6 py-3 font-bold text-ink hover:bg-surface"

>

Explorar FIIs

</Link>

<Link

href="/contato"

className="rounded-lg border border-white/40 px-6 py-3 font-medium text-white hover:bg-white/10"

>

Falar com a gente

</Link>

</div>


</div>


</Container>


</section>

)

}
