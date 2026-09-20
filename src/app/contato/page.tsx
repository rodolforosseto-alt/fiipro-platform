import { ContactForm } from "@/features/contact/components/ContactForm";


export default function ContactPage(){

return (

<main className="mx-auto max-w-3xl p-8">


<h1 className="text-4xl font-bold">

Entre em contato

</h1>


<p className="mt-4 text-gray-600">

Tem dúvidas, sugestões ou gostaria de falar
com a equipe do FIIPro?

</p>


<div className="mt-10">

<ContactForm/>

</div>


</main>

)

}