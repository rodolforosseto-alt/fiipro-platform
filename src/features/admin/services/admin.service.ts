import { supabase } from "@/lib/supabase";


export async function getRecentFeedbacks(){

const { data,error } =

await supabase
.from("feedbacks")
.select("*")
.order(
"created_at",
{
ascending:false
}
)
.limit(10);



if(error){

console.error(
"Erro buscando feedbacks:",
error
);

return [];

}


return data ?? [];

}

export async function getRecentImports(){

const { data,error } =

await supabase

.from("importacoes")

.select(`
id,
tipo,
arquivo_nome,
status,
registros_novos,
registros_duplicados,
created_at
`)

.order(
"created_at",
{
ascending:false
}
)

.limit(10);



if(error){

console.error(
"Erro buscando importações:",
error
);

return [];

}


return data ?? [];

}

export async function getMostAccessedFunds(){

const { data,error } =

await supabase
.from("acessos_fundos")
.select(
"ticker"
);



if(error){

console.error(
"Erro buscando acessos:",
error
);

return [];

}



const agrupado =
data.reduce(
(acc,item)=>{

acc[item.ticker] =
(acc[item.ticker] || 0) + 1;

return acc;

},
{} as Record<string,number>
);



return Object.entries(agrupado)

.map(([ticker,acessos])=>({

ticker,

acessos

}))

.sort(
(a,b)=>
b.acessos - a.acessos
)

.slice(0,10);

}

export async function getAdminMetrics(){

const [

fundos,

acessos,

importacoes,

feedbacks

] = await Promise.all([


supabase
.from("fundos")
.select(
"id",
{
count:"exact",
head:true
}
),



supabase
.from("acessos_fundos")
.select(
"id",
{
count:"exact",
head:true
}
),



supabase
.from("importacoes")
.select(
"id",
{
count:"exact",
head:true
}
),

supabase
.from("feedbacks")
.select(
"id",
{
count:"exact",
head:true
}
)

]);



return {

totalFundos:
fundos.count ?? 0,


totalAcessos:
acessos.count ?? 0,


totalImportacoes:
importacoes.count ?? 0,

totalFeedbacks:
feedbacks.count ?? 0

};

}