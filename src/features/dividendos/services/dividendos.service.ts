import { supabase } from "@/lib/supabase";

export async function getLatestDividendosByFundo(
  fundoId: string
) {

  const { data, error } = await supabase

    .from("dividendos")

    .select("*")

    .eq(
      "fundo_id",
      fundoId
    )

    .order(
      "data_pagamento",
      {
        ascending:false
      }
    )

    .limit(10);


  if(error){

    console.error(
      "Erro buscando últimos dividendos:",
      error
    );

    throw error;

  }


  return data;

}

export async function getDividendosByFundo(fundoId: string) {
  const { data, error } = await supabase
    .from("dividendos")
    .select("*")
    .eq("fundo_id", fundoId)
    .order("data_pagamento", { ascending: false });

  if (error) {
    console.error("Erro buscando dividendos:", error);
    throw error;
  }

  return data;
}

export async function getUpcomingDividendos(){

  const today =
    new Date()
    .toISOString()
    .split("T")[0];


  const { data, error } =
    await supabase
      .from("dividendos")
      .select(`
        id,
        data_pagamento,
        valor,
        fundos (
          ticker,
          nome
        )
      `)
      .gte("data_pagamento", today)
      .order("data_pagamento", {
        ascending:true
      })
      .limit(5);


  if(error){

    console.error(
      "Erro buscando próximos dividendos:",
      error
    );

    throw error;

  }


  return data;

}