"use client";


import { useState } from "react";

import {createImportacao, updateImportacao} from "../services/import.service";

import Papa from "papaparse";

import { importFundos } from "../services/fund-import.service";

export function ImportCsvForm(){


const [arquivo,setArquivo] =
useState<File | null>(null);

const [dados,setDados] =
useState<any[]>([]);


const [mensagem,setMensagem] =
useState("");


function validarCSV(
  dados:any[]
){

  if(dados.length === 0){

    return {

      ok:false,

      mensagem:"Arquivo vazio."

    };

  }


  const camposObrigatorios = [

    "ticker",

    "nome",

    "segmento"

  ];



  for(const campo of camposObrigatorios){

    if(!dados[0]?.[campo]){

      return {

        ok:false,

        mensagem:
        `Campo obrigatório ausente: ${campo}`

      };

    }

  }


  return {

    ok:true,

    mensagem:"CSV válido"

  };

}



async function handleSubmit(
event:React.FormEvent<HTMLFormElement>
){

event.preventDefault();


if(!arquivo){

setMensagem(
"Selecione um arquivo."
);

return;

}


const importacao =
await createImportacao({

  tipo:"fundos",

arquivo_nome:
arquivo.name

});

try {

await importFundos(dados);


await updateImportacao(

importacao.id,

{

status:"concluido",

quantidade_registros:
dados.length

}

);



setMensagem(
"Importação registrada com sucesso."
);


}


catch(error){


await updateImportacao(

importacao.id,

{

status:"erro",

mensagem:
"Falha ao importar dados."

}

);



setMensagem(
"Erro na importação."
);
}

}

return (

<form

onSubmit={handleSubmit}

className="space-y-5"

>


<input

type="file"

accept=".csv"

onChange={(e)=>{


const file =
e.target.files?.[0];


if(!file){

return;

}


setArquivo(file);



Papa.parse(file,{

header:true,

skipEmptyLines:true,


complete:(result)=>{


const dadosCSV =
result.data as any[];


const validacao =
validarCSV(dadosCSV);



if(!validacao.ok){

setMensagem(
validacao.mensagem
);

setDados([]);

return;

}


setDados(dadosCSV);

setMensagem(
"CSV válido."
);

}


});


}}

className="w-full rounded-lg border p-3"

/>

{
dados.length > 0 && (

<div className="rounded-lg border p-4">

<h3 className="font-bold">

Registros encontrados:
{dados.length}

</h3>


<pre className="mt-4 overflow-auto text-sm">

{
JSON.stringify(
dados,
null,
2
)

}

</pre>


</div>

)

}

<button

className="
rounded-lg
bg-blue-600
px-6
py-3
text-white
"

>

Enviar CSV

</button>



{
mensagem && (

<p className="text-gray-600">

{mensagem}

</p>

)

}


</form>

)
}