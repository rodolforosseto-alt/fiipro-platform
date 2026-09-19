import { Card } from "@/components/ui/Card";


interface Props {

gestor: string;

descricao: string | null;

patrimonio: number | null;

numero_cotistas: number | null;

}


function formatNumber(value:number | null){

if(value === null){

return "Não informado";

}

return value.toLocaleString("pt-BR");

}


export function FundInformation({

gestor,

descricao,

patrimonio,

numero_cotistas

}:Props){


return (

<section className="mt-10">


<h2 className="text-2xl font-bold mb-5">

Sobre o fundo

</h2>


<Card>


<div className="grid gap-6 md:grid-cols-3">


<div>

<p className="text-sm text-gray-500">

Gestor

</p>


<strong>

{gestor}

</strong>

</div>



<div>

<p className="text-sm text-gray-500">

Patrimônio

</p>


<strong>

{

patrimonio

?

`R$ ${patrimonio.toLocaleString("pt-BR")}`

:

"Não informado"

}

</strong>

</div>



<div>

<p className="text-sm text-gray-500">

Número de cotistas

</p>


<strong>

{formatNumber(numero_cotistas)}

</strong>

</div>


</div>



<div className="mt-6">


<p className="text-sm text-gray-500">

Descrição

</p>


<p className="mt-2 text-gray-700">

{

descricao ||

"Informações ainda não cadastradas."

}

</p>


</div>


</Card>


</section>

)

}