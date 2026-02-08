import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 text-center">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-foreground mb-6">
            Organize seus agendamentos sem complicações
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Um sistema de agendamento online para empresas, clínicas e prestadores de serviços.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/criar-conta">
                Comece agora
                <ArrowRight className="ml-2" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/entrar">Entrar</Link>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-6">
            Seus clientes agendam através de um link. Não é necessário ter conta.
          </p>
        </div>
      </div>
    </section>
  );
}
