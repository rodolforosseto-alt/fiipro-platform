import { HeroSection } from "@/features/home/components/HeroSection";
import { HowItWorks } from "@/features/home/components/HowItWorks";
import { CallToAction } from "@/features/home/components/CallToAction";
import { FeaturedFunds } from "@/features/home/components/FeaturedFunds";
import { getUpcomingDividendos } from "@/features/dividendos/services/dividendos.service";
import { UpcomingDividends } from "@/features/dividendos/components/UpcomingDividends";

export default async function Home(){

const dividendos =
await getUpcomingDividendos();


return (

<main>

<HeroSection />


<FeaturedFunds />


<UpcomingDividends
dividendos={dividendos}
/>


<HowItWorks />


<CallToAction />


</main>

)

}