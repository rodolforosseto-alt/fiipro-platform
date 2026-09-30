interface Props {

importacoes:any[];

}


export function ImportHistory({
importacoes
}:Props){


return (

<div className="mt-8 rounded-xl border p-6">


<h2 className="text-xl font-bold">

Últimas importações

</h2>


<div className="mt-4 space-y-3">


{importacoes.map((item)=>(


<div
key={item.id}
className="
border-b
pb-3
"
>

<p className="font-semibold">

{item.tipo}

</p>


<p className="text-sm text-gray-500">

{item.arquivo_nome}

</p>


<p className="text-sm">

Novos:
{item.registros_novos}

{" | "}

Duplicados:
{item.registros_duplicados}

</p>


</div>


))}


</div>


</div>

)

}