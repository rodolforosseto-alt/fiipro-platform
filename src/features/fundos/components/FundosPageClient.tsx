"use client";


import { useState } from "react";

import { FundList } from "./FundList";
import { FundSearch } from "./FundSearch";
import { FundFilters } from "./FundFilters";


import {
  getFundos,
  searchFundos,
  getFundosBySegmento
} from "../services/fundos.service";



interface Props {

  initialFundos:any[];

}



export function FundosPageClient({
  initialFundos
}:Props){


  const [fundos,setFundos] =
    useState(initialFundos);


  const [segmento,setSegmento] =
    useState("Todos");



  async function handleSegmento(
    novoSegmento:string
  ){

    setSegmento(novoSegmento);


    if(novoSegmento === "Todos"){

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
        onSearch={async (term)=>{

          const result =
            await searchFundos(term);

          setFundos(result);

        }}
      />


      <FundFilters

        segmento={segmento}

        onChange={handleSegmento}

      />


      <div className="mt-8">

        <FundList fundos={fundos}/>

      </div>


    </>

  );

}