'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Loader2 } from 'lucide-react'; 
import { useToast } from '@/hooks/use-toast';

// === IMPORTAÇÕES DO FIREBASE ===
import { 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider 
} from 'firebase/auth';
import { auth } from '@/lib/firebase'; 

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // === LOGIN COM E-MAIL ===
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
    await signInWithEmailAndPassword(auth, email, password); // ou sua função de login
    
    toast({ title: "Login realizado com sucesso!" });
    
    // MUDE AQUI: Manda para a tela de carregamento primeiro
    router.push('/carregando'); 

}catch (error: any) {
      tratarErroFirebase(error);
    } finally {
      setIsLoading(false);
    }
  };

  // === LOGIN COM GOOGLE ===
  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    const provider = new GoogleAuthProvider();

    try {
      await signInWithPopup(auth, provider);
      
      toast({
        title: 'Bem-vindo!',
        description: 'Login com Google realizado com sucesso.',
      });
      router.push('/carregando');

    } catch (error: any) {
      tratarErroFirebase(error);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Função auxiliar para mensagens de erro amigáveis
  const tratarErroFirebase = (error: any) => {
    console.error("Erro Firebase:", error.code, error.message);
    
    let mensagem = 'Ocorreu um erro ao tentar entrar.';
    
    switch (error.code) {
      case 'auth/invalid-credential':
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        mensagem = 'E-mail ou senha incorretos.';
        break;
      case 'auth/too-many-requests':
        mensagem = 'Muitas tentativas. Aguarde um pouco.';
        break;
      case 'auth/popup-closed-by-user':
        mensagem = 'Login cancelado. Você fechou a janela do Google.';
        break;
    }

    toast({
      variant: 'destructive',
      title: 'Erro no Login',
      description: mensagem,
    });
  };

  return (
    <div className="relative min-h-screen w-full bg-gray-100 dark:bg-gray-950 p-4">
      <Link
        href="/"
        className="absolute top-8 left-8 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para a página inicial
      </Link>
      <div className="flex min-h-screen w-full items-center justify-center">
        <Card className="w-full max-w-md shadow-2xl">
          <CardHeader className="text-center">
            <h1 className="text-2xl font-bold text-primary">Agenda Fácil</h1>
            <CardTitle className="mt-4 text-2xl font-bold text-foreground">Entrar na sua conta</CardTitle>
            <CardDescription>Escolha como deseja entrar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            
            {/* FORMULÁRIO DE E-MAIL */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seuemail@exemplo.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading || isGoogleLoading}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Senha</Label>
                  <Link href="#" className="text-sm font-medium text-primary hover:underline">
                    Esqueceu a senha?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading || isGoogleLoading}
                />
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={isLoading || isGoogleLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Entrar com E-mail'}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Ou continue com</span>
              </div>
            </div>

            {/* BOTÃO DO GOOGLE */}
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={handleGoogleLogin} 
              disabled={isLoading || isGoogleLoading}
            >
              {isGoogleLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                  <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                </svg>
              )}
              Entrar com Google
            </Button>

            <div className="mt-6 text-center text-sm">
              Ainda não tem conta?{' '}
              <Link href="/criar-conta" className="font-medium text-primary hover:underline">
                Criar conta
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}