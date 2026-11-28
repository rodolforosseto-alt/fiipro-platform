import { Container } from "@/components/ui/Container";


interface Props {

total: number;

}


export function StatsBand({
total
}:Props){

const items = [

{ valor: String(total), texto: "fundos acompanhados" },

{ valor: "Diário", texto: "dividendos, cotações e indicadores atualizados" },

{ valor: "Grátis", texto: "para pesquisar e simular" },

];


return (

<section className="border-b border-line bg-surface">


<Container className="grid gap-6 py-8 md:grid-cols-3">


{
items.map((item)=>(

<div key={item.texto}>

<p className="font-display text-5xl leading-none text-brand">

{item.valor}

</p>

<p className="mt-2 text-sm text-muted">

{item.texto}

</p>

</div>

))
}


</Container>


</section>

)

}
