import { Card } from "@/components/ui/Card";
import { UpcomingDividendo } from "../types/upcoming-dividendo";


interface Props {

dividendos: UpcomingDividendo[];

}


export function UpcomingDividends({
  dividendos
}:Props){


if(dividendos.length === 0){

return (

<section className="py-16">


<h2 className="text-center text-3xl font-bold">

Próximos dividendos

</h2>


<p className="mt-5 text-center text-gray-500">

Nenhum dividendo próximo cadastrado.

</p>


</section>

)

}


return (

<section className="py-16">


<h2 className="text-center text-3xl font-bold">

Próximos dividendos

</h2>


<div className="mt-10 grid gap-5 md:grid-cols-3">


{
dividendos.map((item)=>(


<Card key={item.id}>


<h3 className="text-xl font-bold">

{item.fundos?.[0]?.ticker}

</h3>


<p className="text-gray-600">

{item.fundos?.[0]?.nome}

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


<p className="font-bold text-green-600">

R$ {item.valor.toFixed(2)}

</p>


</div>


</Card>


))

}


</div>


</section>

)

}