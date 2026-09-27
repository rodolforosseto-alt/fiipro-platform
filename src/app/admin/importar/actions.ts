"use server";

import { cookies } from "next/headers";


export async function validarAdminSenha(
senha:string
){

if(
senha === process.env.ADMIN_PASSWORD
){

const cookieStore = await cookies();

cookieStore.set(
"fiipro_admin",
"true",
{
httpOnly:true,
secure:true,
sameSite:"strict",
maxAge:60*60*8
}
);

return {
sucesso:true
};

}


return {
sucesso:false
};
}