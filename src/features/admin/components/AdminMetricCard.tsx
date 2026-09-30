interface Props {

title:string;

value:number;

}



export function AdminMetricCard({
title,
value
}:Props){


return (

<div className="
rounded-xl
border
p-6
">


<p className="text-sm text-gray-500">

{title}

</p>


<p className="mt-2 text-3xl font-bold">

{value}

</p>


</div>

)

}