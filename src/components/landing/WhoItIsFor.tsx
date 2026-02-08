import { Card, CardContent } from '@/components/ui/card';
import { Scissors, Stethoscope, Wrench, Sparkles, User } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface BusinessType {
  icon: LucideIcon;
  name: string;
}

const businessTypes: BusinessType[] = [
  { icon: Scissors, name: 'Barbearias e Salões' },
  { icon: Stethoscope, name: 'Clínicas e Consultórios' },
  { icon: Wrench, name: 'Reparos e Manutenção' },
  { icon: Sparkles, name: 'Bem-estar e Estética' },
  { icon: User, name: 'Profissionais Liberais' },
];

export function WhoItIsFor() {
  return (
    <section id="who-it-is-for" className="py-20 md:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Perfeito para qualquer tipo de negócio
          </h2>
          <p className="text-lg text-muted-foreground mb-12">
            De empreendedores solo a grandes equipes, o Agenda Fácil se adapta às suas necessidades.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-8">
          {businessTypes.map((type) => (
            <Card key={type.name} className="p-6 flex flex-col items-center justify-center text-center transition-all duration-300 hover:bg-secondary hover:shadow-xl hover:-translate-y-2">
              <type.icon className="w-10 h-10 mb-4 text-primary" />
              <p className="font-semibold text-foreground">{type.name}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
