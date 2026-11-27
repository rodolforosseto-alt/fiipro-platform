"use client";

import { useState, useTransition } from "react";

import { alterarAtivoFundo } from "@/app/admin/components/actions";

interface FundoAdmin {
  id: string;
  ticker: string;
  nome: string;
  segmento: string | null;
  ativo: boolean | null;
}

interface Props {
  fundos: FundoAdmin[];
}

export function FundosAtivosPanel({ fundos }: Props) {
  const [busca, setBusca] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [pendente, setPendente] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const termo = busca.trim().toLowerCase();
  const filtrados = termo
    ? fundos.filter((f) => f.ticker.toLowerCase().includes(termo) || f.nome.toLowerCase().includes(termo))
    : fundos;

  const totalAtivos = fundos.filter((f) => f.ativo !== false).length;

  function alternar(fundo: FundoAdmin) {
    const novoValor = fundo.ativo === false;
    setErro(null);
    setPendente(fundo.id);

    startTransition(async () => {
      const resultado = await alterarAtivoFundo(fundo.id, novoValor);
      if (!resultado.sucesso) setErro(resultado.erro ?? "Não foi possível alterar o fundo");
      setPendente(null);
    });
  }

  return (
    <div className="rounded-xl border p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-500">
          {totalAtivos} ativos de {fundos.length} fundos
        </p>

        <input
          type="search"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por ticker ou nome"
          className="w-64 rounded-lg border px-3 py-2 text-sm"
        />
      </div>

      {erro && <p className="mt-3 text-sm text-red-600">{erro}</p>}

      <div className="mt-4 max-h-96 overflow-y-auto">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 bg-white">
            <tr className="border-b text-gray-500">
              <th className="p-2">Ticker</th>
              <th className="p-2">Nome</th>
              <th className="p-2">Segmento</th>
              <th className="p-2">Status</th>
              <th className="p-2"></th>
            </tr>
          </thead>

          <tbody>
            {filtrados.map((fundo) => {
              const ativo = fundo.ativo !== false;
              const carregando = isPending && pendente === fundo.id;

              return (
                <tr key={fundo.id} className="border-b">
                  <td className="p-2 font-semibold">{fundo.ticker}</td>
                  <td className="p-2">{fundo.nome}</td>
                  <td className="p-2">{fundo.segmento ?? "--"}</td>
                  <td className="p-2">
                    <span className={ativo ? "text-green-600" : "text-gray-500"}>
                      {ativo ? "Ativo" : "Desativado"}
                    </span>
                  </td>
                  <td className="p-2 text-right">
                    <button
                      type="button"
                      onClick={() => alternar(fundo)}
                      disabled={carregando}
                      className="rounded-lg border px-3 py-1 text-xs font-semibold hover:bg-gray-50 disabled:opacity-50"
                    >
                      {carregando ? "Salvando..." : ativo ? "Desativar" : "Ativar"}
                    </button>
                  </td>
                </tr>
              );
            })}

            {filtrados.length === 0 && (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-500">
                  Nenhum fundo encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
