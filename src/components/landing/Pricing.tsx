'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Check, X, Loader2 } from "lucide-react";
import { useToast } from '@/hooks/use-toast';

// Firebase Imports
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export function Pricing() {
  const router = useRouter();
  const { toast } = useToast();
  
  // State for user and loading
  const [user, setUser] = useState<any>(null);
  const [loadingCheckout, setLoadingCheckout] = useState<string | null>(null); // Stores the ID of the plan being loaded

  // Check login status
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // === STRIPE CHECKOUT LOGIC ===
  const handleSubscribe = async (priceId: string, planName: string) => {
    // 1. If not logged in, redirect to signup
    if (!user) {
      toast({ 
        title: "Crie sua conta primeiro", 
        description: `Para assinar o plano ${planName}, você precisa se cadastrar ou fazer login.` 
      });
      router.push('/criar-conta'); 
      return;
    }

    setLoadingCheckout(priceId);

    try {
      // 2. Call API
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: priceId, 
          userId: user.uid,
          userEmail: user.email,
        }),
      });

      const data = await response.json();

      if (data.url) {
        // 3. Redirect to Stripe
        window.location.href = data.url;
      } else {
        console.error("Erro:", data.error);
        toast({ variant: "destructive", title: "Erro ao iniciar", description: "Tente novamente." });
        setLoadingCheckout(null);
      }
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Erro inesperado", description: "Verifique sua conexão." });
      setLoadingCheckout(null);
    }
  };

  const plans = [
    {
      name: "START",
      price: "Grátis",
      period: "para sempre",
      description: "Ideal para quem está começando ou quer testar sem compromisso.",
      features: [
        { name: "1 Profissional (Você)", included: true },
        { name: "Até 50 agendamentos/mês", included: true },
        { name: "Página de agendamento online", included: true },
        { name: "Marca 'Agenda Fácil' no rodapé", included: true },
        { name: "Agendamentos Ilimitados", included: false },
        { name: "Dashboard Financeiro", included: false },
        { name: "Página White Label (Sem nossa marca)", included: false },
      ],
      cta: "Começar Grátis",
      href: "/criar-conta", // Changed to signup
      variant: "outline" as const,
      highlight: false,
      priceId: null // Free plan has no Stripe ID
    },
    {
      name: "PRO",
      price: "R$ 39,90",
      period: "/mês",
      description: "Para barbearias em crescimento que buscam profissionalismo total.",
      features: [
        { name: "Até 3 Profissionais", included: true },
        { name: "Agendamentos ILIMITADOS", included: true },
        { name: "Página de agendamento online", included: true },
        { name: "Sem a marca 'Agenda Fácil' (White Label)", included: true },
        { name: "Dashboard Financeiro Completo", included: true },
        { name: "Suporte Prioritário", included: false },
      ],
      cta: "Assinar PRO",
      href: "#", // Handled by onClick
      variant: "default" as const,
      highlight: true,
      // ⬇️ AQUI: Usando a variável de ambiente do PRO
      priceId: process.env.NEXT_PUBLIC_PRICE_ID_PRO 
    },
    {
      name: "BUSINESS",
      price: "R$ 79,90",
      period: "/mês",
      description: "Para grandes barbearias com equipes maiores e alta demanda.",
      features: [
        { name: "Profissionais ILIMITADOS", included: true },
        { name: "Agendamentos ILIMITADOS", included: true },
        { name: "Página de agendamento online", included: true },
        { name: "Sem a marca 'Agenda Fácil' (White Label)", included: true },
        { name: "Dashboard Financeiro Completo", included: true },
        { name: "Suporte Prioritário (WhatsApp)", included: true },
      ],
      cta: "Assinar Business",
      href: "#", 
      variant: "outline" as const,
      highlight: false,
      // ⬇️ AQUI: Usando a variável de ambiente do BUSINESS
      priceId: process.env.NEXT_PUBLIC_PRICE_ID_BUSINESS 
    },
  ];

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/30" id="precos">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <div className="space-y-2">
            <div className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm text-primary font-medium">
              Planos e Preços
            </div>
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
              Cresça no seu ritmo.
            </h2>
            <p className="max-w-[700px] text-muted-foreground md:text-xl">
              Comece grátis e faça o upgrade quando precisar de mais recursos e remover nossa marca.
            </p>
          </div>
        </div>

        {/* --- GRID MODIFICADO PARA ALINHAMENTO --- */}
        <div className="grid md:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto px-4">
          {plans.map((plan, index) => (
            <div 
              key={index} 
              className={`relative flex flex-col p-6 bg-background rounded-xl shadow-sm transition-all duration-200 h-full ${
                plan.highlight 
                  ? 'border-2 border-primary shadow-2xl md:scale-110 z-10' // O scale fará ele crescer a partir do centro
                  : 'border border-border hover:border-primary/50'
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-4 left-0 right-0 mx-auto w-fit rounded-full bg-primary px-4 py-1 text-xs font-medium text-primary-foreground shadow-sm">
                  Mais Escolhido
                </div>
              )}
              
              <div className="space-y-2 mb-6">
                <h3 className={`text-2xl font-bold ${plan.highlight ? 'text-primary' : ''}`}>{plan.name}</h3>
                <p className="text-muted-foreground text-sm min-h-[40px]">{plan.description}</p>
              </div>
              
              <div className="flex items-baseline mb-6">
                <span className="text-4xl font-extrabold tracking-tight">{plan.price}</span>
                <span className="ml-1 text-muted-foreground text-sm font-medium">{plan.period}</span>
              </div>
              
              {/* O flex-1 garante que a lista ocupe o espaço e empurre o botão para baixo, alinhando-os */}
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center text-sm gap-3">
                    {feature.included ? (
                      <div className={`p-1 rounded-full shrink-0 ${plan.highlight ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'}`}>
                        <Check className="w-3 h-3" />
                      </div>
                    ) : (
                      <div className="bg-muted p-1 rounded-full text-muted-foreground shrink-0">
                        <X className="w-3 h-3" />
                      </div>
                    )}
                    <span className={feature.included ? "text-foreground font-medium" : "text-muted-foreground"}>
                      {feature.name}
                    </span>
                  </li>
                ))}
              </ul>

              {plan.priceId ? (
                 <Button 
                    className={`w-full font-bold shadow-sm ${plan.highlight ? 'text-lg h-12' : ''}`} 
                    variant={plan.variant} 
                    size={plan.highlight ? "lg" : "default"}
                    disabled={loadingCheckout === plan.priceId}
                    onClick={() => handleSubscribe(plan.priceId!, plan.name)}
                 >
                   {loadingCheckout === plan.priceId ? <Loader2 className="animate-spin mr-2 h-4 w-4"/> : null}
                   {plan.cta}
                 </Button>
              ) : (
                <Link href={user ? "/dashboard" : "/criar-conta"} className="w-full">
                  <Button className="w-full" variant={plan.variant} size="lg">
                    {user ? "Ir para Dashboard" : plan.cta}
                  </Button>
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}