"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled || isMenuOpen ? 'bg-background/80 backdrop-blur-sm border-b' : 'bg-transparent'
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="text-2xl font-bold text-primary">
            Agenda Fácil
          </Link>
          
          <nav className="hidden md:flex items-center space-x-2">
            <Button variant="ghost" asChild>
              <Link href="/entrar">Entrar</Link>
            </Button>
            <Button asChild>
              <Link href="/criar-conta">Criar conta</Link>
            </Button>
          </nav>

          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              <span className="sr-only">Alternar menu</span>
            </Button>
          </div>
        </div>
      </div>
      
      {isMenuOpen && (
        <div className="md:hidden bg-background/95 border-t">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col space-y-4">
            <Button variant="ghost" asChild className="w-full justify-start text-lg">
              <Link href="/entrar">Entrar</Link>
            </Button>
            <Button asChild className="w-full text-lg">
              <Link href="/criar-conta">Criar conta</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
