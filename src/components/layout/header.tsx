import Link from "next/link";


export function Header(){

return (

<header className="border-b bg-white">


<div className="mx-auto flex max-w-6xl items-center justify-between p-5">


<Link
href="/"
className="text-2xl font-bold text-blue-900"
>
FIIPro
</Link>


<nav className="flex gap-6">


<Link href="/">
Início
</Link>


<Link href="/fundos">
Fundos
</Link>


<Link href="/calculadora">
Calculadora
</Link>


</nav>


<button className="rounded-lg bg-green-600 px-4 py-2 text-white">
Entrar
</button>


</div>


</header>

)

}