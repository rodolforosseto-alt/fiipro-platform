import { supabase } from "@/lib/supabase";

import { Cotacao } from "../types/cotacao";


export async function getCotacoesByFundo(
  fundoId:string
):Promise<Cotacao[]> {


const {data,error} =

await supabase

.from("cotacoes_historico")

.select(`
id,
fundo_id,
data,
valor,
created_at
`)

.eq(
"fundo_id",
fundoId
)

.order(
"data",
{
ascending:true
}
);



if(error){

console.error(
"Erro buscando cotações:",
error
);

throw error;

}


return data ?? [];

}