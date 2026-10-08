import { supabase } from "@/lib/supabase";

import { ImportResult }
from "../types/import-result";

async function atualizarCotacaoAtual(){

  const { data: fundos, error } =
    await supabase
      .from("fundos")
      .select("id");


  if(error){

    throw error;

  }


  for(const fundo of fundos){


    const { data: cotacao, error: cotacaoError } =

      await supabase

        .from("cotacoes_historico")

        .select("valor,data")

        .eq(
          "fundo_id",
          fundo.id
        )

        .order(
          "data",
          {
            ascending:false
          }
        )

        .limit(1)

        .maybeSingle();



    if(cotacaoError){

      console.error(
        "Erro buscando cotação:",
        fundo.id
      );

      continue;

    }



    if(cotacao){


      await supabase

        .from("fundos")

        .update({

          cotacao:
          cotacao.valor,

          ultima_atualizacao:
          new Date()

        })

        .eq(
          "id",
          fundo.id
        );


    }


  }

}

export async function importCotacoes(
dados:any[]
):Promise<ImportResult>
{

const cotacoes = [];

let novos = 0;

let duplicados = 0;

let erros = 0;

for(const item of dados){


const { data:fundo,error:fundoError } =

await supabase
.from("fundos")
.select("id")
.eq("ticker",item.ticker)
.single();



if(fundoError){

console.error(
`Fundo não encontrado: ${item.ticker}`
);

erros++;

continue;

}

const { data:existente } =

await supabase

.from("cotacoes_historico")

.select("id")

.eq(
"fundo_id",
fundo.id
)

.eq(
"data",
item.data
)

.maybeSingle();



if(existente){

duplicados++;

continue;

}


novos++;


cotacoes.push({

fundo_id:fundo.id,

data:item.data,

valor:Number(item.valor),

});



}

alert(
JSON.stringify(
{
totalRecebido:dados.length,
cotacoesParaInserir:cotacoes.length,
novos,
duplicados,
erros
},
null,
2
)
);

if(cotacoes.length === 0){

  await atualizarCotacaoAtual();


  return {

    processados:
    dados.length,

    novos,

    duplicados,

    erros

  };

}

const {data,error}=

await supabase
.from("cotacoes_historico")
.upsert(

cotacoes,

{

onConflict:
"fundo_id,data"

}

)
.select();



if(error){

console.error(
"Erro importando cotações:",
error
);

throw error;

}

await atualizarCotacaoAtual();


alert(
"RETORNO COTAÇÕES:\n" +
JSON.stringify(
{
processados:dados.length,
novos,
duplicados,
erros
},
null,
2
)
);

return {

processados:
dados.length,

novos,

duplicados,

erros

};

}