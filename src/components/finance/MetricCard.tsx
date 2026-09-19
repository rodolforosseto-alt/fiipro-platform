import { Card } from "@/components/ui/Card";


interface Props {

title:string;

value:string;

description?:string;

}


export function MetricCard({
title,
value,
description
}:Props){


return (

<Card>

<p className="text-sm text-gray-500">
{title}
</p>


<p className="mt-2 text-3xl font-bold text-gray-900">
{value}
</p>


{
description && (

<p className="mt-2 text-sm text-gray-500">
{description}
</p>

)
}


</Card>

)

}