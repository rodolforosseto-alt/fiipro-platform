import { Dividendo } from "../types/dividendo";


interface Props {
  dividendos: Dividendo[];
}


export function DividendHistory({ dividendos }: Props) {

  return (

    <section className="mt-10">

      <h2 className="text-2xl font-bold mb-5">
        Histórico de dividendos
      </h2>


      <div className="border rounded-xl overflow-hidden">

        <table className="w-full">

          <thead className="bg-gray-100">

            <tr>

              <th className="text-left p-4">
                Data pagamento
              </th>

              <th className="text-left p-4">
                Valor por cota
              </th>

            </tr>

          </thead>


          <tbody>

            {
              dividendos.map((dividendo)=>(

                <tr
                  key={dividendo.id}
                  className="border-t"
                >

                  <td className="p-4">

                    {new Date(
                      dividendo.data_pagamento
                    ).toLocaleDateString("pt-BR")}

                  </td>


                  <td className="p-4 text-green-600 font-semibold">

                    R$ {dividendo.valor.toFixed(2)}

                  </td>


                </tr>

              ))
            }

          </tbody>


        </table>

      </div>


    </section>

  );

}