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

throw error;

}


return data;

}

export async function updateImportacao(

id:string,

dados:{

status:string;

quantidade_registros?:number;

registros_processados?:number;

registros_novos?:number;

registros_duplicados?:number;

registros_atualizados?:number;

registros_erro?:number;

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

throw error;

}


return data;

}