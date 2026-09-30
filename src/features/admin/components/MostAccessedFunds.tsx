interface Props {

fundos:{
ticker:string;
acessos:number;
}[];

}


export function MostAccessedFunds({
fundos
}:Props){


return (

<div className="
mt-8
rounded-xl
border
p-6
">


<h2 className="
text-xl
font-bold
">

Fundos mais acessados

</h2>



<div className="mt-4 space-y-3">


{

fundos.map((fundo,index)=>(

<div

key={fundo.ticker}

className="
flex
justify-between
border-b
pb-2
"

>


<span>

{index + 1}º {fundo.ticker}

</span>


<span className="font-semibold">

{fundo.acessos} acessos

</span>


</div>


))

}


</div>


</div>

)

}