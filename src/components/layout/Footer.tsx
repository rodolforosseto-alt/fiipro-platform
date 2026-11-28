import Link from "next/link";


export function Footer(){

return (

<footer className="mt-20 border-t border-line bg-surface">


<div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-10 md:flex-row md:justify-between">


<div className="max-w-sm">

<p className="font-display text-4xl leading-none tracking-wide text-ink">

FII<span className="text-brand">PRO</span>

</p>


<p className="mt-3 text-sm text-muted">

Plataforma de acompanhamento de fundos imobiliários,
por Rodolfo Rosseto.

</p>

</div>



<nav className="flex flex-col gap-2 text-sm text-muted">


<Link href="/fundos" className="hover:text-brand">

Fundos

</Link>


<Link href="/calculadora" className="hover:text-brand">

Calculadora

</Link>


<Link href="/contato" className="hover:text-brand">

Contato

</Link>


<Link href="/feedback" className="hover:text-brand">

Enviar sugestão

</Link>


</nav>



<p className="max-w-md text-xs text-muted">

Conteúdo informativo e educacional. Não é recomendação
de investimento. Rentabilidade passada não garante
resultados futuros. Os indicadores têm defasagem:
confira sempre a data de referência de cada informação.

</p>


</div>



<div className="mx-auto max-w-6xl border-t border-line px-6 py-5 text-center text-sm text-muted">

© {new Date().getFullYear()} FIIPro

</div>


</footer>

)

}
