"use client";


import { useState } from "react";

import { validarAdminSenha }
from "./actions";


export function AdminLogin(){


const [senha,setSenha] =
useState("");

const [erro,setErro] =
useState("");



async function entrar(){

const resultado =
await validarAdminSenha(senha);


if(resultado.sucesso){

window.location.reload();

}else{

setErro(
"Senha inválida."
);

}

}



return (

<div className="mt-8 rounded-xl border p-6">


<h2 className="text-xl font-bold">

Área administrativa

</h2>


<p className="mt-2 text-gray-600">

Digite a senha para continuar.

</p>



<input

type="password"

value={senha}

onChange={(e)=>
setSenha(e.target.value)
}

className="
mt-4
w-full
rounded-lg
border
p-3
"

/>



<button

onClick={entrar}

className="
mt-4
rounded-lg
bg-blue-600
px-5
py-3
text-white
"

>

Entrar

</button>



{
erro && (

<p className="mt-3 text-red-600">

{erro}

</p>

)

}


</div>

)

}