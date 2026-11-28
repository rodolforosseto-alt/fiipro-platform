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
"bg-brand text-white hover:bg-brand-dark",

secondary:
"border border-brand text-brand hover:bg-surface"

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