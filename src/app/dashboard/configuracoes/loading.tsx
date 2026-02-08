
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function SettingsLoading() {
  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <header className="flex items-center gap-4">
        <Skeleton className="h-9 w-9 md:hidden" />
        <div>
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-80 mt-2" />
        </div>
      </header>
      <main className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          {/* Business Info Skeleton */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64 mt-2" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex flex-col items-center gap-2">
                    <Skeleton className="h-24 w-24 rounded-full" />
                    <Skeleton className="h-8 w-28" />
                </div>
                <div className="w-full space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full" /></div>
                  <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full" /></div>
              </div>
              <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full" /></div>
              <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-20 w-full" /></div>
            </CardContent>
          </Card>

          {/* Opening Hours Skeleton */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-56" />
               <Skeleton className="h-4 w-72 mt-2" />
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex flex-wrap gap-2">
                    {Array.from({ length: 7 }).map((_, i) => <Skeleton key={i} className="h-10 w-10" />)}
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full" /></div>
                    <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full" /></div>
                </div>
                 <Skeleton className="h-6 w-56" />
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1 space-y-8">
          {/* Appearance Skeleton */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-56 mt-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>

          {/* Professionals Skeleton */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
               <Skeleton className="h-4 w-64 mt-2" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-10 w-40" />
            </CardContent>
          </Card>
          
          {/* Public Link Skeleton */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
               <Skeleton className="h-4 w-64 mt-2" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <div className="flex gap-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
