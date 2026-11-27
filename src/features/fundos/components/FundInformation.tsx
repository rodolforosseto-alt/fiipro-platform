import { Card } from "@/components/ui/Card";

import { formatCompactMoney } from "@/lib/format";


interface Props {

gestor: string;

descricao: string | null;

patrimonio: number | null;

numero_cotistas: number | null;

tipo_fundo?: string | null;

tipo_gestao?: string | null;

administrador?: string | null;

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

numero_cotistas,

tipo_fundo,

tipo_gestao,

administrador

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

formatCompactMoney(patrimonio)

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



{tipo_fundo && (

<div>

<p className="text-sm text-gray-500">

Tipo de fundo

</p>

<strong>

{tipo_fundo}

</strong>

</div>

)}



{tipo_gestao && (

<div>

<p className="text-sm text-gray-500">

Tipo de gestão

</p>

<strong>

{tipo_gestao}

</strong>

</div>

)}



{administrador && (

<div>

<p className="text-sm text-gray-500">

Administrador

</p>

<strong>

{administrador}

</strong>

</div>

)}


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