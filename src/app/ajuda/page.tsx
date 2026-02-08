
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { LifeBuoy } from 'lucide-react';

export default function HelpPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 text-center">
        <div className="bg-primary/10 text-primary p-4 rounded-full mb-4">
            <LifeBuoy className="w-10 h-10" />
        </div>
      <h1 className="text-4xl font-bold tracking-tight mb-2">Central de Ajuda</h1>
      <p className="text-muted-foreground text-lg max-w-2xl mb-8">
        Página em construção. Em breve, você encontrará aqui tutoriais, FAQs e
        nosso contato de suporte.
      </p>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Precisa de ajuda agora?</CardTitle>
          <CardDescription>
            Entre em contato conosco pelo e-mail:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <a
            href="mailto:suporte@agendafacil.com"
            className="text-primary font-bold text-lg hover:underline"
          >
            suporte@agendafacil.com
          </a>
        </CardContent>
      </Card>
    </div>
  );
}

    