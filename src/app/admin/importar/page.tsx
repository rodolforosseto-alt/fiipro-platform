import { ImportCsvForm } from "@/features/importacoes/components/ImportCsvForm";

import { cookies } from "next/headers";

import { AdminLogin }
from "./AdminLogin";

export default async function ImportarPage(){

const cookieStore = await cookies();

const autorizado =
cookieStore.get("fiipro_admin")?.value === "true";

return (

<main className="mx-auto max-w-3xl p-8">


<h1 className="text-3xl font-bold">

Importar dados

</h1>


<p className="mt-3 text-gray-600">

Envie um arquivo CSV para atualizar o FIIPro.

</p>


<div className="mt-8">

{
autorizado
?

<ImportCsvForm />

:

<AdminLogin />

}

<p className="text-red-600">
Área administrativa protegida.
</p>

</div>


</main>

)

}