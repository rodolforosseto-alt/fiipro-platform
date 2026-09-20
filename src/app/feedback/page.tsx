import { FeedbackForm } from "@/features/feedback/components/FeedbackForm";


export default function FeedbackPage(){

return (

<main className="mx-auto max-w-3xl p-8">


<h1 className="text-4xl font-bold">

Ajude a construir o FIIPro

</h1>


<p className="mt-4 text-gray-600">

Estamos criando uma plataforma de fundos imobiliários
e sua opinião ajuda a definir as próximas melhorias.

</p>


<div className="mt-10">

<FeedbackForm/>

</div>


</main>

)

}