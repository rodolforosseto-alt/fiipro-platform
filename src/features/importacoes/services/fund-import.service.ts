import { supabase } from "@/lib/supabase";


export async function importFundos(
dados:any[]
){

const { data,error } =

await supabase
.from("fundos")
.upsert(
dados,
{
onConflict:"ticker"
}
);



if(error){

console.error(
"Erro importando fundos:",
error
);

throw error;

}


return data;

}