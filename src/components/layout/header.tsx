"use client";


import { useState } from "react";
import Link from "next/link";


export function Header(){

  const [open,setOpen] = useState(false);


  return (

    <header className="relative border-b bg-white">


      <div className="mx-auto flex max-w-6xl items-center justify-between p-5">


        <Link
          href="/"
          className="text-2xl font-bold text-blue-900"
        >
          FIIPro
        </Link>



        {/* Desktop */}

        <nav className="hidden gap-6 md:flex">

          <Link href="/">
            Início
          </Link>


          <Link href="/fundos">
            Fundos
          </Link>


          <Link href="/calculadora">
            Calculadora
          </Link>


          <button className="rounded-lg bg-green-600 px-4 py-2 text-white">
            Entrar
          </button>

        </nav>



        {/* Mobile */}

        <button

          type="button"

          className="relative z-[9999] text-3xl md:hidden"

          onClick={() => setOpen(!open)}

        >

          ☰

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
            bg-white
            p-5
            md:hidden
            "

          >

            <Link
              href="/"
              onClick={()=>setOpen(false)}
            >
              Início
            </Link>


            <Link
              href="/fundos"
              onClick={()=>setOpen(false)}
            >
              Fundos
            </Link>


            <Link
              href="/calculadora"
              onClick={()=>setOpen(false)}
            >
              Calculadora
            </Link>


            <button className="rounded-lg bg-green-600 px-4 py-2 text-white">
              Entrar
            </button>


          </nav>

        )
      }


    </header>

  );

}