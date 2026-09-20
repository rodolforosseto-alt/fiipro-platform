"use client";


import { useState } from "react";

import { createFeedback } from "../services/feedback.service";


export function FeedbackForm(){


const [enviado,setEnviado] =
useState(false);



async function handleSubmit(
  event: React.FormEvent<HTMLFormElement>
){

  event.preventDefault();


  const form = event.currentTarget;


  const data = new FormData(form);


  await createFeedback({

    nome: String(data.get("nome")),

    email: String(data.get("email")),

    tipo: String(data.get("tipo")),

    mensagem: String(data.get("mensagem"))

  });


  form.reset();


  setEnviado(true);

}



if(enviado){

return (

<div className="rounded-xl border p-8 text-center">

<h2 className="text-2xl font-bold">

Obrigado pelo feedback!

</h2>


<p className="mt-3 text-gray-600">

Sua sugestão ajuda a construir o FIIPro.

</p>

</div>

)

}



return (

<form

onSubmit={handleSubmit}

className="space-y-5"


>


<input

name="nome"

placeholder="Seu nome"

className="w-full rounded-lg border p-3"

/>



<input

name="email"

placeholder="Seu email"

type="email"

className="w-full rounded-lg border p-3"

/>



<select

name="tipo"

className="w-full rounded-lg border p-3"

>


<option>

Sugestão de melhoria

</option>


<option>

Erro encontrado

</option>


<option>

Dúvida

</option>


<option>

Outro

</option>


</select>



<textarea

name="mensagem"

placeholder="Como podemos melhorar?"

className="h-32 w-full rounded-lg border p-3"

/>



<button

className="rounded-lg bg-green-600 px-6 py-3 text-white"

>

Enviar sugestão

</button>


</form>

)

}