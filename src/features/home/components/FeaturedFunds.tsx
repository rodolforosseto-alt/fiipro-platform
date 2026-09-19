import { getFundos } from "@/features/fundos/services/fundos.service";
import { FundList } from "@/features/fundos/components/FundList";
import { Container } from "@/components/ui/Container";


export async function FeaturedFunds(){

  const fundos = await getFundos();


  const fundosDestaque =
    fundos.slice(0,3);


  return (

    <section className="py-16">


      <Container>


        <h2 className="text-center text-3xl font-bold">

          FIIs em destaque

        </h2>


        <p className="mt-3 text-center text-gray-600">

          Consulte os principais fundos acompanhados pelo FIIPro.

        </p>


        <div className="mt-10">

          <FundList fundos={fundosDestaque}/>

        </div>


      </Container>


    </section>

  );

}