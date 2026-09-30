interface Props {

feedbacks:any[];

}


export function FeedbackList({
feedbacks
}:Props){


return (

<div className="
mt-8
rounded-xl
border
p-6
">


<h2 className="text-xl font-bold">

Últimos feedbacks

</h2>


<div className="mt-4 space-y-4">


{

(feedbacks ?? []).map((item)=>(


<div

key={item.id}

className="
border-b
pb-3
"


>


<p className="font-semibold">

{item.assunto ?? "Sugestão"}

</p>


<p className="text-gray-600">

{item.mensagem}

</p>


<p className="mt-1 text-sm text-gray-400">

{
new Date(
item.created_at
).toLocaleDateString(
"pt-BR"
)
}

</p>


</div>


))

}


</div>


</div>

)

}