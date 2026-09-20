import Link from "next/link";


export function Footer(){

return (

<footer className="mt-20 border-t bg-white p-8">


<div className="mx-auto flex max-w-6xl flex-col gap-6 md:flex-row md:items-center md:justify-between">


<div>

<p className="text-xl font-bold text-blue-900">

FIIPro

</p>


<p className="mt-2 text-sm text-gray-600">

Sua plataforma de acompanhamento
de fundos imobiliários.

</p>

</div>



<nav className="flex flex-col gap-2 text-sm text-gray-600">


<Link href="/fundos">

Fundos

</Link>


<Link href="/calculadora">

Calculadora

</Link>


<Link href="/contato">

Contato

</Link>


<Link href="/feedback">

Enviar sugestão

</Link>


</nav>


</div>



<div className="mx-auto mt-8 max-w-6xl border-t pt-6 text-center text-sm text-gray-500">

© {new Date().getFullYear()} FIIPro

</div>


</footer>

)

}