import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function CTA() {
  return (
    <section id="cta" className="bg-secondary py-20 md:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-foreground mb-8">
          Simplifique seus agendamentos hoje mesmo.
        </h2>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" asChild>
            <Link href="/criar-conta">
              Criar conta
              <ArrowRight className="ml-2" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/entrar">Entrar</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
