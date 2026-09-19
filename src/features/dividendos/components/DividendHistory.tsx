import { Dividendo } from "../types/dividendo";


interface Props {
  dividendos: Dividendo[];
}


export function DividendHistory({ dividendos }: Props) {

  if (dividendos.length === 0) {

    return (
      <section className="mt-10">

        <h2 className="text-2xl font-bold">
          Histórico de dividendos
        </h2>

        <div className="mt-5 rounded-xl border p-6 text-gray-500">
          Ainda não existem dividendos cadastrados para este fundo.
        </div>

      </section>
    );
  }


  return (
    <section className="mt-10">

      <h2 className="mb-5 text-2xl font-bold">
        Histórico de dividendos
      </h2>


      <div className="overflow-hidden rounded-xl border">

        <table className="w-full">

          <thead className="bg-gray-100">

            <tr>

              <th className="p-4 text-left">
                Data pagamento
              </th>

              <th className="p-4 text-left">
                Valor por cota
              </th>

            </tr>

          </thead>


          <tbody>

            {dividendos.map((dividendo) => (

              <tr
                key={dividendo.id}
                className="border-t"
              >

                <td className="p-4">
                  {new Date(
                    dividendo.data_pagamento
                  ).toLocaleDateString("pt-BR")}
                </td>


                <td className="p-4 font-semibold text-green-600">
                  R$ {dividendo.valor.toFixed(2)}
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </section>
  );
}