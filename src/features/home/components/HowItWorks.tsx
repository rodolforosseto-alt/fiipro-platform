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

<section className="py-16">


<Container>


<h2 className="text-center text-3xl font-bold">

Como funciona

</h2>


<div className="mt-10 grid gap-6 md:grid-cols-3">

...

</div>


</Container>


</section>

)

}