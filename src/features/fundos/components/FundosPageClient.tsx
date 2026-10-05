"use client";


import { useState } from "react";

import { FundList } from "./FundList";
import { FundSearch } from "./FundSearch";
import { FundFilters } from "./FundFilters";
import { FundAutocomplete } from "./FundAutocomplete";


import {
  getFundos,
  searchFundos,
  getFundosBySegmento
} from "../services/fundos.service";



interface Props {

  initialFundos: any[];

}



export function FundosPageClient({
  initialFundos
}: Props) {


  const [fundos, setFundos] =
    useState(initialFundos);


  const [segmento, setSegmento] =
    useState("Todos");



  async function handleSegmento(
    novoSegmento: string
  ) {

    setSegmento(novoSegmento);


    if (novoSegmento === "Todos") {

      const result =
        await getFundos();

      setFundos(result);

      return;

    }


    const result =
      await getFundosBySegmento(
        novoSegmento
      );


    setFundos(result);

  }


  return (

    <>

      <FundSearch
        onSearch={async (term) => {

          const result =
            await searchFundos(term);

          setFundos(result);

        }}
      />


      <FundFilters

        segmento={segmento}

        onChange={handleSegmento}

      />


      <div className="mt-6 text-sm text-gray-500">

        {fundos.length} fundos encontrados

      </div>



      {
        fundos.length === 0 ? (

          <div className="mt-10 rounded-xl border p-8 text-center">

            <h3 className="text-xl font-bold">
              Nenhum fundo encontrado
            </h3>


            <p className="mt-2 text-gray-500">
              Tente outro ticker ou segmento.
            </p>

          </div>

        ) : (

          <div className="mt-8">

            <FundList fundos={fundos} />

          </div>

        )
      }


    </>

  )  
}