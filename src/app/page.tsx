import { Header } from '@/components/landing/Header';
import { Hero } from '@/components/landing/Hero';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { WhoItIsFor } from '@/components/landing/WhoItIsFor';
import { ClientExperience } from '@/components/landing/ClientExperience';
import { Benefits } from '@/components/landing/Benefits';
import { Pricing } from '@/components/landing/Pricing'; // <--- IMPORTAR
import { CTA } from '@/components/landing/CTA';
import { Footer } from '@/components/landing/Footer';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        <Hero />
        <HowItWorks />
        <WhoItIsFor />
        <Pricing />  {/* <--- ADICIONAR AQUI */}
        <ClientExperience />
        <Benefits />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}