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

// === FIREBASE ===
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore'; // Importação para salvar no Banco
import { auth, db } from '@/lib/firebase';

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  // === ESTADOS DOS CAMPOS ===
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repName, setRepName] = useState(''); // Nome do Representante
  const [phone, setPhone] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [cep, setCep] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);

  // Máscara simples para telefone
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
    value = value.replace(/(\d)(\d{4})$/, '$1-$2');
    setPhone(value);
  };

  // Máscara simples para CEP
  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    value = value.replace(/^(\d{5})(\d)/, '$1-$2');
    setCep(value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. Cria o Login (Autenticação)
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Atualiza o perfil básico (Nome do Representante)
      await updateProfile(user, {
        displayName: repName
      });

      // 3. Salva os DADOS EXTRAS no Banco de Dados (Firestore)
      // Cria um documento na coleção 'users' com o mesmo ID do login
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: email,
        representativeName: repName,
        phone: phone,
        businessName: businessName,
        cep: cep,
        createdAt: new Date(),
        plan: "free" // Já deixa preparado para planos futuros
      });

      toast({
        title: 'Conta criada com sucesso!',
        description: 'Seus dados foram salvos. Redirecionando...',
      });

      router.push('/dashboard');

    } catch (error: any) {
      console.error("Erro cadastro:", error);
      let mensagem = "Erro ao criar conta.";

      if (error.code === 'auth/email-already-in-use') {
        mensagem = "Este e-mail já está sendo usado.";
      } else if (error.code === 'auth/weak-password') {
        mensagem = "A senha deve ser mais forte (min 6 letras).";
      }

      toast({
        variant: "destructive",
        title: "Erro ao cadastrar",
        description: mensagem
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-gray-950 text-gray-100 p-4 flex items-center justify-center">
      {/* Link de Voltar */}
      <Link
        href="/"
        className="absolute top-8 left-8 flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </Link>

      <Card className="w-full max-w-lg bg-gray-900 border-gray-800 shadow-2xl text-gray-100">
        <CardHeader className="text-center pb-2">
          <h1 className="text-2xl font-bold text-sky-500">Agenda Fácil</h1>
          <CardTitle className="mt-2 text-xl font-bold">Criar sua conta</CardTitle>
          <CardDescription className="text-gray-400">
            Configure sua agenda e comece a receber agendamentos online
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* E-MAIL */}
            <div className="space-y-1">
              <Label htmlFor="email" className="text-gray-300">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seuemail@empresa.com"
                required
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-sky-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* NOME REPRESENTANTE */}
            <div className="space-y-1">
              <Label htmlFor="repName" className="text-gray-300">Nome do representante</Label>
              <Input
                id="repName"
                placeholder="Seu nome completo"
                required
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-sky-500"
                value={repName}
                onChange={(e) => setRepName(e.target.value)}
              />
              <p className="text-xs text-gray-500">Pessoa responsável pela conta</p>
            </div>

            {/* TELEFONE */}
            <div className="space-y-1">
              <Label htmlFor="phone" className="text-gray-300">Número para contato</Label>
              <Input
                id="phone"
                placeholder="(00) 00000-0000"
                required
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-sky-500"
                value={phone}
                onChange={handlePhoneChange}
                maxLength={15}
              />
            </div>

            {/* NOME DO NEGÓCIO */}
            <div className="space-y-1">
              <Label htmlFor="businessName" className="text-gray-300">Nome da loja ou negócio</Label>
              <Input
                id="businessName"
                placeholder="Nome do seu negócio"
                required
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-sky-500"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Esse nome será exibido para seus clientes no momento do agendamento.
              </p>
            </div>

            {/* CEP */}
            <div className="space-y-1">
              <Label htmlFor="cep" className="text-gray-300">CEP</Label>
              <Input
                id="cep"
                placeholder="00000-000"
                required
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-sky-500"
                value={cep}
                onChange={handleCepChange}
                maxLength={9}
              />
              <p className="text-xs text-gray-500">Usado para identificar a localização do seu negócio</p>
            </div>

            {/* SENHA */}
            <div className="space-y-1">
              <Label htmlFor="password" className="text-gray-300">Criar senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Crie uma senha segura"
                required
                minLength={6}
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-sky-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* BOTÃO */}
            <Button 
              type="submit" 
              className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold h-11" 
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Criar conta'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-400">
            Já tem uma conta?{' '}
            <Link href="/entrar" className="font-medium text-sky-400 hover:underline">
              Entrar
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}