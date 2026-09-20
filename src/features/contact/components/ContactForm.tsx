"use client";


import { useState } from "react";

import { createContact } from "../services/contact.service";


export function ContactForm(){

const [enviado,setEnviado] =
useState(false);



async function handleSubmit(
event:React.FormEvent<HTMLFormElement>
){

event.preventDefault();


const form =
event.currentTarget;


const data =
new FormData(form);



await createContact({

nome:String(data.get("nome")),

email:String(data.get("email")),

assunto:String(data.get("assunto")),

mensagem:String(data.get("mensagem"))

});


form.reset();


setEnviado(true);

}



if(enviado){

return (

<div className="rounded-xl border p-8 text-center">

<h2 className="text-2xl font-bold">

Mensagem enviada!

</h2>


<p className="mt-3 text-gray-600">

Entraremos em contato em breve.

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

type="email"

placeholder="Seu email"

className="w-full rounded-lg border p-3"

/>


<input

name="assunto"

placeholder="Assunto"

className="w-full rounded-lg border p-3"

/>


<textarea

name="mensagem"

placeholder="Digite sua mensagem"

className="h-32 w-full rounded-lg border p-3"

/>


<button

className="rounded-lg bg-green-600 px-6 py-3 text-white"

>

Enviar mensagem

</button>


</form>

)

}