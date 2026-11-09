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


export async function getUpcomingDividendos() {

  // Data atual no horário de Brasília
  const partesData = new Intl.DateTimeFormat(
    "en-CA",
    {
      timeZone: "America/Sao_Paulo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }
  ).formatToParts(new Date());

  const partes = Object.fromEntries(
    partesData.map((parte) => [
      parte.type,
      parte.value
    ])
  );

  const today =
    `${partes.year}-${partes.month}-${partes.day}`;

  const { data, error } = await supabase

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
      ascending: true
    });


  if (error) {

    console.error(
      "Erro buscando próximos dividendos:",
      error
    );

    throw error;

  }


  // Normaliza o relacionamento com fundos
  const registros = (data ?? []).map((item) => ({

    ...item,

    fundos: Array.isArray(item.fundos)
      ? item.fundos[0]
      : item.fundos

  }));


  // Seleciona somente um pagamento por fundo
  const fundosSelecionados = new Map();

  for (const item of registros) {

    if (!item.fundos?.ticker) {
      continue;
    }

    if (!fundosSelecionados.has(item.fundos.ticker)) {

      fundosSelecionados.set(
        item.fundos.ticker,
        item
      );

    }

  }


  // Retorna os seis próximos fundos
  return Array.from(
    fundosSelecionados.values()
  ).slice(0, 6);

}