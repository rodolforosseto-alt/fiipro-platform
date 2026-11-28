"use client";


import { useState } from "react";
import Link from "next/link";


const links = [
  { href: "/", label: "Início" },
  { href: "/fundos", label: "Fundos" },
  { href: "/calculadora", label: "Calculadora" },
  { href: "/contato", label: "Contato" },
];


export function Header(){

  const [open,setOpen] = useState(false);


  return (

    <header className="relative border-b border-line bg-white">


      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">


        <Link
          href="/"
          className="font-display text-4xl leading-none tracking-wide text-ink"
        >
          FII<span className="text-brand">PRO</span>
        </Link>



        {/* Desktop */}

        <nav className="hidden items-center gap-7 md:flex">

          {
            links.map((item) => (

              <Link
                key={item.href}
                href={item.href}
                className="font-medium text-ink hover:text-brand"
              >
                {item.label}
              </Link>

            ))
          }

          <Link
            href="/fundos"
            className="rounded-lg bg-brand px-5 py-2.5 font-bold text-white hover:bg-brand-dark"
          >
            Explorar FIIs
          </Link>

        </nav>



        {/* Mobile */}

        <button

          type="button"

          aria-label="Abrir menu"

          aria-expanded={open}

          className="relative z-[9999] rounded-lg border border-line px-3 py-2 text-ink md:hidden"

          onClick={() => setOpen(!open)}

        >

          {open ? "Fechar" : "Menu"}

        </button>


      </div>



      {
        open && (

          <nav

            className="
            absolute
            left-0
            top-full
            z-[9998]
            flex
            w-full
            flex-col
            gap-4
            border-b
            border-line
            bg-white
            p-6
            md:hidden
            "

          >

            {
              links.map((item) => (

                <Link
                  key={item.href}
                  href={item.href}
                  onClick={()=>setOpen(false)}
                  className="font-medium text-ink"
                >
                  {item.label}
                </Link>

              ))
            }

            <Link
              href="/fundos"
              onClick={()=>setOpen(false)}
              className="rounded-lg bg-brand px-5 py-3 text-center font-bold text-white"
            >
              Explorar FIIs
            </Link>

          </nav>

        )
      }


    </header>

  );

}
