"use client";


import { useState } from "react";

import { FundList } from "./FundList";

import { FundSearch } from "./FundSearch";

import { searchFundos } from "../services/fundos.service";



export function FundosPageClient({initialFundos}:any){


const [fundos,setFundos]=useState(initialFundos);



async function handleSearch(term:string){

const result = await searchFundos(term);

setFundos(result);

}



return (

<>

<FundSearch onSearch={handleSearch}/>


<div className="mt-8">

<FundList fundos={fundos}/>

</div>


</>

)

}