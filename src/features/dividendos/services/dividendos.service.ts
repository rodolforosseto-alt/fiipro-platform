import { supabase } from "@/lib/supabase";

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