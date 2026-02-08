import { CalendarClock, UserMinus, BellRing, Smartphone, Briefcase, CheckCircle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface Benefit {
  icon: LucideIcon;
  title: string;
  description: string;
}

const benefits: Benefit[] = [
  {
    icon: CalendarClock,
    title: 'Agenda online 24/7',
    description: 'Permita que os clientes agendem horários a qualquer momento, mesmo fora do horário comercial.',
  },
  {
    icon: BellRing,
    title: 'Lembretes automáticos',
    description: 'Reduza o não comparecimento com lembretes automáticos por e-mail ou SMS para seus clientes.',
  },
  {
    icon: UserMinus,
    title: 'Menos não comparecimentos',
    description: 'Clientes que agendam online estão mais comprometidos em comparecer.',
  },
  {
    icon: Smartphone,
    title: 'Compatível com celular e desktop',
    description: 'Gerencie sua agenda e aceite agendamentos de qualquer dispositivo, em qualquer lugar.',
  },
  {
    icon: Briefcase,
    title: 'Mais organização',
    description: 'Centralize sua agenda e informações de clientes em uma única plataforma profissional.',
  },
  {
    icon: CheckCircle,
    title: 'Sincronização de Calendário',
    description: 'Evite agendamentos duplicados sincronizando com seus calendários existentes do Google ou Outlook.',
  }
];

export function Benefits() {
  return (
    <section id="benefits" className="py-20 md:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Tudo que você precisa para o seu negócio
          </h2>
          <p className="text-lg text-muted-foreground mb-12">
            Descubra os benefícios de ter um sistema de agendamento inteligente e automatizado.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          {benefits.map((benefit) => (
            <div key={benefit.title} className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="bg-primary/10 text-primary p-3 rounded-lg">
                  <benefit.icon className="w-6 h-6" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{benefit.title}</h3>
                <p className="text-muted-foreground">{benefit.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
