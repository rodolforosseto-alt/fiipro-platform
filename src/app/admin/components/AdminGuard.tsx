import { cookies } from "next/headers";

import { AdminLogin }
from "../importar/AdminLogin";


interface Props {

children: React.ReactNode;

}


export async function AdminGuard({
children
}:Props){


const cookieStore =
await cookies();


const autorizado =
cookieStore.get("fiipro_admin")?.value === "true";


if(!autorizado){

return <AdminLogin />;

}


return children;

}