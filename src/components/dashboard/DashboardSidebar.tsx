'use client';

import {
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from '@/components/ui/sidebar';
import { LayoutDashboard, Settings, LifeBuoy, GanttChartSquare, CalendarCheck, LogOut, Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { pendingPath, setPendingPath, setIsLoading } = useSidebar();

  useEffect(() => {
    setIsLoading(false);
    setPendingPath(null);
  }, [pathname, setIsLoading, setPendingPath]);

  const menuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/servicos', label: 'Meus serviços', icon: GanttChartSquare },
    { href: '/dashboard/agendamentos', label: 'Agendamentos', icon: CalendarCheck },
    { href: '/dashboard/profissionais', label: 'Profissionais', icon: Users },
    { href: '/dashboard/configuracoes', label: 'Configurações', icon: Settings },
  ];

  const handleLogout = () => {
    // Em uma aplicação real, você também limparia o estado de autenticação do usuário.
    router.push('/');
  };

  const handleNavigate = (href: string) => {
    if (pathname !== href) {
      setIsLoading(true);
      setPendingPath(href);
    }
  };


  return (
    <>
      <SidebarHeader>
        <h2 className="text-xl font-bold text-primary px-2">Agenda Fácil</h2>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={(pathname.startsWith(item.href) && (item.href !== '/dashboard' || pathname === '/dashboard')) || pendingPath === item.href}
                tooltip={item.label}
              >
                <Link href={item.href} onClick={() => handleNavigate(item.href)}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout} tooltip="Sair">
              <LogOut />
              <span>Sair</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Ajuda">
              <Link href="/ajuda" onClick={() => handleNavigate('/ajuda')}>
                <LifeBuoy />
                <span>Ajuda</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}
