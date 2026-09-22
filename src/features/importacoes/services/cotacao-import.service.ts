import { supabase } from "@/lib/supabase";


export async function importCotacoes(
dados:any[]
){

const cotacoes = [];



for(const item of dados){


const { data:fundo,error:fundoError } =

await supabase
.from("fundos")
.select("id")
.eq("ticker",item.ticker)
.single();



if(fundoError){

console.error(
`Fundo não encontrado: ${item.ticker}`
);

continue;

}



cotacoes.push({

fundo_id:fundo.id,

data:item.data,

valor:Number(item.valor),

});



}



if(cotacoes.length === 0){

return [];

}



const {data,error}=

await supabase
.from("cotacoes_historico")
.upsert(

cotacoes,

{

onConflict:
"fundo_id,data"

}

);



if(error){

console.error(
"Erro importando cotações:",
error
);

throw error;

}



return data;

}