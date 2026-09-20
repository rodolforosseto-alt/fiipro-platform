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

export async function getFundoByTicker(ticker: string) {

  if (!ticker) {
    return null;
  }

  const { data, error } = await supabase
    .from("fundos")
    .select("*")
    .eq("ticker", ticker.trim().toUpperCase())
    .eq("ativo", true)
    .maybeSingle();

  if (error) {
    console.error("Erro buscando fundo:", error);
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

export async function getFundosBySegmento(
  segmento:string
){

  const { data,error } = await supabase
    .from("fundos")
    .select("*")
    .eq("segmento", segmento)
    .eq("ativo", true);


  if(error){

    console.error(
      "Erro buscando fundos por segmento:",
      error
    );

    throw error;

  }


  return data;

}

export async function searchFundosAutocomplete(
  term:string
){

  if(!term || term.trim().length < 2){

    return [];

  }


  const { data,error } =
    await supabase
      .from("fundos")
      .select(
        `
        id,
        ticker,
        nome,
        segmento
        `
      )
      .or(
      `ticker.ilike.%${term}%,nome.ilike.%${term}%`
      )
      .eq("ativo",true)
      .limit(5);



  if(error){

    console.error(
      "Erro no autocomplete:",
      error
    );

    throw error;

  }


  return data;

}