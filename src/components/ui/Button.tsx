import { ReactNode } from "react";


interface Props {

children: ReactNode;

variant?: "primary" | "secondary";

}


export function Button({
children,
variant = "primary"
}: Props){


const styles = {

primary:
"bg-green-600 text-white hover:bg-green-700",

secondary:
"border border-blue-600 text-blue-600 hover:bg-blue-50"

};


return (

<button

className={`
px-5
py-3
rounded-lg
font-semibold
transition
${styles[variant]}
`}

>

{children}

</button>

)

}