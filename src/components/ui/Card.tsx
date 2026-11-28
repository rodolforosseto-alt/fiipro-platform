import { ReactNode } from "react";


interface Props {

children: ReactNode;

className?: string;

}


export function Card({
children,
className=""
}:Props){


return (

<div

className={`
rounded-xl
border
border-line
bg-white
p-6
${className}
`}

>

{children}

</div>

)

}
