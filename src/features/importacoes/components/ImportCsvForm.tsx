"use client";

import { useState } from "react";

import {
  createImportacao,
  updateImportacao
} from "../services/import.service";

import Papa from "papaparse";

import { importFundos } from "../services/fund-import.service";

import { validarFundosCSV } from "../validators/fundos.validator";

import { validarDividendosCSV } from "../validators/dividendos.validator";

import { importDividendos } from "../services/dividend-import.service";

export function ImportCsvForm(){


const [arquivo,setArquivo] =
useState<File | null>(null);

const [dados,setDados] =
useState<any[]>([]);

const [mensagem,setMensagem] =
useState("");

const [tipo,setTipo] =
useState("fundos");

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

  tipo:tipo,

arquivo_nome:
arquivo.name

});

try {

if(tipo === "fundos"){

  await importFundos(dados);

}else if(tipo === "dividendos"){

  await importDividendos(dados);

}
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


<select

value={tipo}

onChange={(e)=>
setTipo(e.target.value)
}

className="w-full rounded-lg border p-3"

>

<option value="fundos">

Fundos

</option>


<option value="dividendos">

Dividendos

</option>


</select>



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
result.data as any[]

const validacao =
tipo === "fundos"
? validarFundosCSV(dadosCSV)
: validarDividendosCSV(dadosCSV);


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