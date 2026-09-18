import { supabase } from "@/lib/supabase";


export async function getFundos(){

  const { data, error } = await supabase
    .from("fundos")
    .select("*")
    .eq("ativo", true);


  if(error){

    console.error(error);

    throw error;

  }


  return data;

}