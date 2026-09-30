import { AdminGuard }
from "../components/AdminGuard";

import { AdminMetricCard }
from "@/features/admin/components/AdminMetricCard";

import { MostAccessedFunds }
from "@/features/admin/components/MostAccessedFunds";

import {
  getAdminMetrics,
  getMostAccessedFunds,
  getRecentImports,
  getRecentFeedbacks
}
from "@/features/admin/services/admin.service";

import { ImportHistory }
from "@/features/admin/components/ImportHistory";

import { FeedbackList }
from "@/features/admin/components/FeedbackList";

import { AdminSectionTitle }
from "@/features/admin/components/AdminSectionTitle";

export default async function DashboardPage(){


const metrics =
await getAdminMetrics();

const fundosMaisAcessados =
await getMostAccessedFunds();

const importacoes =
await getRecentImports();

const feedbacks =
await getRecentFeedbacks();


return (

<AdminGuard>

<main className="p-8">


<h1 className="text-3xl font-bold">
Dashboard FIIPro
</h1>


<section className="mt-10">

<AdminSectionTitle

title="📊 Visão geral"

description="Resumo atual da plataforma"

/>


<div className="grid gap-5 md:grid-cols-4">


<AdminMetricCard

title="Fundos cadastrados"

value={metrics.totalFundos}

/>


<AdminMetricCard

title="Acessos aos fundos"

value={metrics.totalAcessos}

/>


<AdminMetricCard

title="Importações realizadas"

value={metrics.totalImportacoes}

/>


<AdminMetricCard

title="Feedbacks recebidos"

value={metrics.totalFeedbacks}

/>


</div>
</section>


<section className="mt-10">

<AdminSectionTitle

title="👥 Interesse dos usuários"

description="Fundos mais acessados pelos visitantes"

/>


<MostAccessedFunds

fundos={fundosMaisAcessados}

/>

</section>



<section className="mt-10">

<AdminSectionTitle

title="⚙ Operação"

description="Acompanhamento das cargas de dados"

/>


<ImportHistory

importacoes={importacoes}

/>

</section>



<section className="mt-10">

<AdminSectionTitle

title="💬 Comunicação"

description="Sugestões enviadas pelos usuários"

/>


<FeedbackList

feedbacks={feedbacks}

/>

</section>



</main>

</AdminGuard>


)

}