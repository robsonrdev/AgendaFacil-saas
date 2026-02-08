// src/app/termos/page.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  ShieldCheck, 
  FileText, 
  Mail, 
  CheckCircle2, 
  Lock 
} from "lucide-react";

export default function TermosPage() {
  return (
    <div className="min-h-screen bg-muted/30 py-12 px-4 sm:px-6">
      <div className="container mx-auto max-w-4xl">
        
        {/* Botão de Voltar */}
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="pl-0 hover:bg-transparent hover:text-primary transition-colors">
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para o Início
            </Button>
          </Link>
        </div>

        <Card className="shadow-lg border-border/60">
          <CardHeader className="space-y-4 pb-8 border-b bg-muted/10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-1">
                <CardTitle className="text-3xl font-bold tracking-tight text-primary">
                  Termos de Uso e Privacidade
                </CardTitle>
                <CardDescription className="text-base">
                  Transparência total sobre como operamos e cuidamos dos seus dados.
                </CardDescription>
              </div>
              <Badge variant="outline" className="w-fit h-fit py-1 px-3 bg-background">
                Atualizado em: {new Date().toLocaleDateString()}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="pt-8 px-6 md:px-10 space-y-10">
            
            {/* SEÇÃO 1: TERMOS DE USO */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-full bg-primary/10 text-primary">
                  <FileText className="h-5 w-5" />
                </div>
                <h2 className="text-2xl font-semibold tracking-tight">1. Termos de Uso</h2>
              </div>
              
              <p className="text-muted-foreground leading-relaxed">
                Bem-vindo ao <strong>Agenda Fácil</strong>. Ao acessar nosso site e utilizar nossos serviços, 
                você concorda com as condições abaixo descritas. Nosso objetivo é facilitar a gestão do seu negócio 
                com eficiência e segurança.
              </p>

              <div className="grid sm:grid-cols-2 gap-4 mt-4">
                <div className="bg-muted/50 p-4 rounded-lg border space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" /> O Serviço
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Fornecemos uma plataforma SaaS (Software as a Service) completa para gestão de agendamentos online.
                  </p>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg border space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" /> Assinatura & Cancelamento
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Cobrança recorrente (mensal). Você tem total liberdade para cancelar a qualquer momento direto pelo painel.
                  </p>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg border space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" /> Reembolso Garantido
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Garantia de 7 dias. Se não gostar, devolvemos 100% do valor da primeira mensalidade sem burocracia.
                  </p>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg border space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" /> Uso Aceitável
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    A plataforma deve ser usada para fins legítimos. Atividades ilegais ou spam resultarão em bloqueio.
                  </p>
                </div>
              </div>
            </section>

            <Separator />

            {/* SEÇÃO 2: PRIVACIDADE */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                 <div className="p-2 rounded-full bg-primary/10 text-primary">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h2 className="text-2xl font-semibold tracking-tight">2. Política de Privacidade (LGPD)</h2>
              </div>
              
              <p className="text-muted-foreground leading-relaxed">
                Levamos sua segurança a sério. Estamos em total conformidade com a Lei Geral de Proteção de Dados (Lei 13.709/2018).
                Seus dados são seus, nós apenas os guardamos com segurança.
              </p>

              <div className="space-y-6 mt-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">2.1 O que coletamos?</h3>
                  <ul className="list-none space-y-2">
                    <li className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                      <span><strong>Dados de Cadastro:</strong> Apenas o essencial (Nome, E-mail e Foto) via Google Login seguro.</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                      <span><strong>Dados Financeiros:</strong> Processados externamente pelo <strong>Stripe</strong>. Nós nunca temos acesso ao número completo do seu cartão.</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                      <span><strong>Dados de Uso:</strong> Informações de agendamentos para fazer o sistema funcionar.</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">2.2 Como usamos?</h3>
                  <p className="text-sm text-muted-foreground mb-2">Seus dados são usados exclusivamente para:</p>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground marker:text-primary marker:font-bold">
                    <li>Prestar o serviço contratado e manter o sistema no ar.</li>
                    <li>Processar pagamentos e emitir faturas.</li>
                    <li>Enviar notificações críticas sobre sua conta (ex: confirmação de pagamento).</li>
                  </ol>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-100 dark:border-blue-900">
                  <h3 className="font-semibold text-blue-800 dark:text-blue-300 flex items-center gap-2 mb-1">
                    <Lock className="w-4 h-4" /> Seus Direitos
                  </h3>
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    Você é o dono dos dados. Pode solicitar a exportação ou a exclusão completa da sua conta e de todos os registros a qualquer momento.
                  </p>
                </div>
              </div>
            </section>

          </CardContent>
          
          <Separator />
          
          <CardFooter className="bg-muted/10 p-6 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-semibold flex items-center gap-2">
                <Mail className="h-4 w-4" /> Ainda tem dúvidas?
              </h3>
              <p className="text-sm text-muted-foreground">
                Nossa equipe jurídica e de suporte está à disposição.
              </p>
            </div>
            <Button variant="outline" asChild>
              <a href="mailto:use.agendafacil@gmail.com">
                use.agendafacil@gmail.com
              </a>
            </Button>
          </CardFooter>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-8">
          © {new Date().getFullYear()} Agenda Fácil. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}