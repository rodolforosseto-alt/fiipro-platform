import Link from "next/link";
import { Container } from "@/components/ui/Container";


export function HeroSection(){

return (

<section className="py-20">


<Container className="text-center">


<h1 className="text-5xl font-bold text-gray-900">

Analise fundos imobiliários
com mais clareza

</h1>


<p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">

Acompanhe dividendos, cotações e indicadores
dos seus fundos imobiliários em uma plataforma
simples e completa.

</p>


<div className="mt-8 flex justify-center gap-4">


<Link

href="/calculadora"

className="rounded-lg bg-green-600 px-6 py-3 font-semibold text-white"

>

Simular bola de neve

</Link>


<Link

href="/fundos"

className="rounded-lg border border-blue-600 px-6 py-3 font-semibold text-blue-600"

>

Explorar FIIs

</Link>


</div>


</Container>


</section>

)

}