import { supabase } from "@/lib/supabase";

import { ImportResult }
from "../types/import-result";

export async function importDividendos(
dados:any[]
):Promise<ImportResult>
{

const dividendos = [];



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



dividendos.push({

fundo_id:fundo.id,

data_corte:
item.data_corte ?? null,

data_pagamento:
item.data_pagamento,

valor:
Number(item.valor),

fonte_dados:
"CSV",

ultima_atualizacao:
new Date().toISOString()

});


}



if(dividendos.length === 0){

return {

processados:0,

novos:0,

duplicados:0,

erros:0

};

}


const { data,error } =

await supabase
.from("dividendos")
.upsert(
dividendos,
{
onConflict:
"fundo_id,data_pagamento,valor"
}
)
.select();



if(error){

console.error(
"Erro importando dividendos:",
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