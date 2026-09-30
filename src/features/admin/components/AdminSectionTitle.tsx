interface Props {
  title:string;
  description?:string;
}


export function AdminSectionTitle({
title,
description
}:Props){

return (

<div className="mb-4">

<h2 className="text-2xl font-bold">
{title}
</h2>


{
description && (

<p className="mt-1 text-gray-500">
{description}
</p>

)
}

</div>

)

}