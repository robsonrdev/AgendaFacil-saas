import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarPlus, Share2, ClipboardCheck } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface Step {
  icon: LucideIcon;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    icon: CalendarPlus,
    title: '1. Crie sua agenda',
    description: 'Defina seus horários disponíveis e serviços oferecidos em apenas alguns cliques.',
  },
  {
    icon: Share2,
    title: '2. Compartilhe seu link',
    description: 'Compartilhe seu link exclusivo em suas redes sociais, site ou diretamente com os clientes.',
  },
  {
    icon: ClipboardCheck,
    title: '3. Clientes agendam sozinhos',
    description: 'Seus clientes podem agendar horários facilmente 24/7, sem precisar entrar em contato.',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 md:py-32 bg-secondary">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Começar é fácil
          </h2>
          <p className="text-lg text-muted-foreground mb-12">
            Comece a receber agendamentos em três passos simples.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <Card key={step.title} className="text-center border-none bg-transparent shadow-none">
              <CardHeader className="flex justify-center items-center">
                <div className="bg-primary/10 text-primary p-4 rounded-full">
                  <step.icon className="w-8 h-8" />
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="mb-2 text-xl font-semibold">{step.title}</CardTitle>
                <p className="text-muted-foreground">{step.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
