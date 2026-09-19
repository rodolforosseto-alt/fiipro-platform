import Link from "next/link";

export default function NotFound() {

  return (
    <main className="flex min-h-[60vh] items-center justify-center p-8">

      <div className="text-center">

        <h1 className="text-3xl font-bold">
          Fundo não encontrado
        </h1>

        <p className="mt-3 text-gray-600">
          Não encontramos esse fundo imobiliário no FIIPro.
        </p>

        <Link
          href="/fundos"
          className="mt-6 inline-block rounded-lg bg-blue-600 px-5 py-3 text-white"
        >
          Voltar para fundos
        </Link>

      </div>

    </main>
  );
}