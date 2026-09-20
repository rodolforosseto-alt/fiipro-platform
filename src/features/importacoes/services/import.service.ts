import { supabase } from "@/lib/supabase";


export async function createImportacao(
dados:{
tipo:string;

arquivo_nome:string;

}
){

const { data,error } =
await supabase
.from("importacoes")
.insert({

tipo:dados.tipo,

arquivo_nome:dados.arquivo_nome

})
.select()
.single();


if(error){

console.error(
"Erro criando importação:",
error
);

throw error;

}


return data;

}

export async function updateImportacao(

id:string,

dados:{
status:string;

quantidade_registros?:number;

mensagem?:string;

}

){

const {data,error} =

await supabase
.from("importacoes")
.update({

...dados,

finalizado_em:
new Date().toISOString()

})

.eq("id",id);



if(error){

console.error(
"Erro atualizando importação:",
error
);

throw error;

}


return data;

}