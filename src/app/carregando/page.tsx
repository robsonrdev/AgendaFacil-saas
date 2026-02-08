'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import './loading.css';
import { Loader2 } from 'lucide-react'; // Ícone opcional

export default function LoadingPage() {
  const router = useRouter();

  useEffect(() => {
    // Espera 3 segundos e manda para o dashboard
    const timer = setTimeout(() => {
      router.replace('/dashboard');
    }, 3000); 

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="loading-container mb-4">
        {/* O atributo data-text é usado pelo CSS para a animação */}
        <h1 className="loading-text" data-text="Agenda Fácil">
          Agenda Fácil
        </h1>
      </div>
      
      <div className="flex items-center gap-2 text-muted-foreground animate-pulse">
        <Loader2 className="h-4 w-4 animate-spin" />
        <p>Preparando seu sistema...</p>
      </div>
    </div>
  );
}