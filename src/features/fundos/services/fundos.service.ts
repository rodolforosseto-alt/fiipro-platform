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

export async function getFundoByTicker(ticker:string){

  const { data, error } = await supabase
    .from("fundos")
    .select("*")
    .eq("ticker", ticker)
    .single();


  if(error){

    throw error;

  }


  return data;

}

export async function searchFundos(term:string){

  const { data,error } = await supabase
    .from("fundos")
    .select("*")
    .or(
      `ticker.ilike.%${term}%,nome.ilike.%${term}%`
    )
    .eq("ativo",true);


  if(error){

    throw error;

  }


  return data;

}