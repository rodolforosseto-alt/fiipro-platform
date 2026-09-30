import { ImportCsvForm }
from "@/features/importacoes/components/ImportCsvForm";

import { AdminGuard }
from "../components/AdminGuard";


export default function ImportarPage(){


return (

<AdminGuard>


<main className="mx-auto max-w-3xl p-8">


<h1 className="text-3xl font-bold">
Importar dados
</h1>


<p className="mt-3 text-gray-600">
Envie um arquivo CSV para atualizar o FIIPro.
</p>


<div className="mt-8">

<ImportCsvForm />

</div>


</main>


</AdminGuard>

)

}