import { AdminLogin } from "./AdminLogin";

import { isAdminAuthenticated } from "@/lib/admin-session";


interface Props {

children: React.ReactNode;

}


export async function AdminGuard({
children
}:Props){

if(!(await isAdminAuthenticated())){

return <AdminLogin />;

}

return children;

}
