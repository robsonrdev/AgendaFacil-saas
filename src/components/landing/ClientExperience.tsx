import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card } from '@/components/ui/card';

export function ClientExperience() {
  const placeholderImage = PlaceHolderImages.find(p => p.id === 'client-booking-interface');

  return (
    <section id="client-experience" className="py-20 md:py-32 bg-secondary">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="max-w-md">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Seus clientes escolhem um horário em segundos. Sem login, sem atrito.
            </h2>
            <p className="text-lg text-muted-foreground">
              Oferecemos uma experiência de agendamento tão simples e rápida que seus clientes vão adorar. Diga adeus aos e-mails e telefonemas de vaivém.
            </p>
          </div>
          <div>
            {placeholderImage && (
              <Card className="overflow-hidden shadow-2xl">
                <Image
                  src={placeholderImage.imageUrl}
                  alt={placeholderImage.description}
                  width={1200}
                  height={900}
                  data-ai-hint={placeholderImage.imageHint}
                  className="w-full h-auto"
                />
              </Card>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
