import { HeroSection } from "@/features/home/components/HeroSection";
import { StatsBand } from "@/features/home/components/StatsBand";
import { Rankings } from "@/features/home/components/Rankings";
import { HowItWorks } from "@/features/home/components/HowItWorks";
import { ChannelSection } from "@/features/home/components/ChannelSection";
import { CallToAction } from "@/features/home/components/CallToAction";
import { getFundos } from "@/features/fundos/services/fundos.service";
import { getUpcomingDividendos } from "@/features/dividendos/services/dividendos.service";
import { UpcomingDividends } from "@/features/dividendos/components/UpcomingDividends";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home(){

const [fundos, dividendos] = await Promise.all([
getFundos(),
getUpcomingDividendos(),
]);


return (

<main>

<HeroSection />


<StatsBand total={fundos.length} />


<Rankings fundos={fundos} />


<UpcomingDividends
dividendos={dividendos}
/>


<ChannelSection />


<HowItWorks />


<CallToAction />


</main>

)

}
