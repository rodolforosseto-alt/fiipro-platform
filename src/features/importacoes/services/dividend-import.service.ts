import { supabase } from "@/lib/supabase";

import { ImportResult }
from "../types/import-result";

export async function importDividendos(
dados:any[]
):Promise<ImportResult>
{

const dividendos = [];

let novos = 0;

let duplicados = 0;

let erros = 0;

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

erros++;

continue;

}

const { data:existente } =

await supabase

.from("dividendos")

.select("id")

.eq(
"fundo_id",
fundo.id
)

.eq(
"data_pagamento",
item.data_pagamento
)

.eq(
"valor",
Number(item.valor)
)

.maybeSingle();



if(existente){

duplicados++;

continue;

}


novos++;

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

processados:
dados.length,

novos,

duplicados,

erros

};

}

const dividendosUnicos =
Array.from(
new Map(
dividendos.map(item => [
`${item.fundo_id}-${item.data_pagamento}-${item.valor}`,
item
])
).values()
);

const { data,error } =

await supabase
.from("dividendos")
.upsert(
dividendosUnicos,
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

novos,

duplicados,

erros


};

}