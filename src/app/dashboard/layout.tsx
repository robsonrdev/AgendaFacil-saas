import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { PageLoader } from '@/components/ui/page-loader';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <PageLoader />
      <Sidebar>
        <DashboardSidebar />
      </Sidebar>
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
