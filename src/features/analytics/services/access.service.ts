import { supabase } from "@/lib/supabase";


export async function registrarAcessoFundo(
fundoId:string,
ticker:string
){


const { error } =

await supabase
.from("acessos_fundos")
.insert({

fundo_id:fundoId,

ticker

});



if(error){

console.error(
"Erro registrando acesso:",
JSON.stringify(error, null, 2)
);

}

}