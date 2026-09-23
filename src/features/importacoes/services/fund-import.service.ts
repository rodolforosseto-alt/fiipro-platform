import { supabase } from "@/lib/supabase";

import { ImportResult }
from "../types/import-result";


export async function importFundos(
dados:any[]
):Promise<ImportResult>
{

let novos = 0;

let atualizados = 0;

for(const item of dados){


const { data:existente } =

await supabase
.from("fundos")
.select("id")
.eq("ticker",item.ticker)
.maybeSingle();



if(existente){

atualizados++;

}else{

novos++;

}

}



const { data,error } =

await supabase
.from("fundos")
.upsert(
dados,
{
onConflict:"ticker"
}
)
.select();



if(error){

throw error;

}

return {

processados:
dados.length,

novos,

atualizados,

erros:0

};

}