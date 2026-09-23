import { supabase } from "@/lib/supabase";

import { ImportResult }
from "../types/import-result";

export async function importCotacoes(
dados:any[]
):Promise<ImportResult>
{

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

return {

processados:0,

novos:0,

duplicados:0,

erros:0

};

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

)
.select();



if(error){

console.error(
"Erro importando cotações:",
error
);

throw error;

}



return {

  processados:
  dados.length,

  novos:
  data?.length ?? 0,

  duplicados:
  dados.length - (data?.length ?? 0),

  erros:0

};

}