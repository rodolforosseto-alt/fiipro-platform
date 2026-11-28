import { formatDividend } from "@/lib/format";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { UpcomingDividendo } from "../types/upcoming-dividendo";


interface Props {

dividendos: UpcomingDividendo[];

}


export function UpcomingDividends({
  dividendos
}:Props){


if(dividendos.length === 0){

return (

<section className="pt-16"><Container>


<h2 className="font-display text-5xl uppercase leading-none tracking-wide text-ink">

Próximos dividendos

</h2>


<p className="mt-5 text-muted">

Nenhum dividendo próximo cadastrado.

</p>


</Container></section>

)

}


return (

<section className="pt-16"><Container>


<h2 className="font-display text-5xl uppercase leading-none tracking-wide text-ink">

Próximos dividendos

</h2>


<div className="mt-8 grid gap-5 md:grid-cols-3">


{
dividendos.map((item)=>(


<Card key={item.id}>


<h3 className="text-xl font-bold">

{item.fundos?.ticker}

</h3>


<p className="text-gray-600">

{item.fundos?.nome}

</p>


<div className="mt-4">

<p className="text-sm text-gray-500">

Data pagamento

</p>


<p>

{

new Date(
item.data_pagamento
)
.toLocaleDateString("pt-BR")

}

</p>


</div>



<div className="mt-4">

<p className="text-sm text-gray-500">

Valor por cota

</p>


<p className="font-bold text-brand">

R$ {formatDividend(item.valor)}

</p>


</div>


</Card>


))

}


</div>


</Container></section>

)

}