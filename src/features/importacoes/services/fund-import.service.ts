import { supabase } from "@/lib/supabase";

import { ImportResult }
from "../types/import-result";


function removerCamposVazios(obj:any){

const resultado:any = {};

Object.entries(obj).forEach(
([chave,valor])=>{

if(
valor !== null &&
valor !== undefined &&
valor !== ""
){

resultado[chave] = valor;

}

});

return resultado;

}


export async function importFundos(
dados:any[]
):Promise<ImportResult>
{

let novos = 0;

let atualizados = 0;

let semAlteracao = 0;

let detalhesAlteracao:any[] = [];


for(const item of dados){


const { data:existente } =

await supabase

.from("fundos")

.select(`
 id,
 nome,
 segmento,
 gestor,
 patrimonio,
 numero_cotistas,
 descricao,
 fonte_dados
`)

.eq(
"ticker",
item.ticker
)

.maybeSingle();



if(existente){

const camposComparar = [
  "nome",
  "segmento",
  "gestor",
  "patrimonio",
  "numero_cotistas",
  "descricao"
];


const mudou =

camposComparar.some(
(campo)=>{

const valorCSV = item[campo];

const valorBanco =
existente[campo as keyof typeof existente];


if(
valorCSV === undefined ||
valorCSV === "" ||
valorCSV === null
){

return false;

}



if(valorCSV != valorBanco){

console.log(
"Campo diferente:",
{
ticker:item.ticker,
campo,
valorCSV,
valorBanco
}
);

return true;

}


return false;

});

if(mudou){

atualizados++;

detalhesAlteracao.push({
  ticker:item.ticker,
  csv:item,
  banco:existente
});

}else{

semAlteracao++;

}


}else{

novos++;

}


}



const dadosTratados =

dados.map(
(item)=>
removerCamposVazios(item)
);



const { error } =

await supabase

.from("fundos")

.upsert(
dadosTratados,
{
onConflict:"ticker"
}
);



if(error){

throw error;

}



return {

processados:
dados.length,

novos,

atualizados,

semAlteracao,

erros:0

};


}