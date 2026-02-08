import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-background border-t mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          
          {/* Lado Esquerdo: Logo e Copyright */}
          <div className="text-center md:text-left mb-4 md:mb-0">
            <Link href="/" className="text-xl font-bold text-primary">
              Agenda Fácil
            </Link>
            <p className="text-muted-foreground text-sm mt-1">
              © {new Date().getFullYear()} Agenda Fácil. Todos os direitos reservados.
            </p>
          </div>

          {/* Lado Direito: Link para a página de Termos */}
          <div className="flex items-center space-x-6">
            <Link 
              href="/termos" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors hover:underline"
            >
              Termos de Uso e Privacidade
            </Link>
          </div>

        </div>
      </div>
    </footer>
  );
}