import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Clock,
  CreditCard,
  MapPin,
  Phone,
  Car,
  Wifi,
  Fan,
  Accessibility,
} from 'lucide-react';

export default function PublicBookingLoading() {
  return (
    <div className="bg-background">
      <header className="h-16 border-b flex items-center px-4 md:px-8">
        <Skeleton className="h-6 w-40" />
      </header>
      <div className="container mx-auto px-4 py-8">
        {/* Gallery Skeleton */}
        <div className="mb-8">
          <Skeleton className="w-full aspect-[16/9] md:aspect-[2/1] rounded-lg" />
        </div>

        {/* Sticky Header Skeleton */}
        <div className="flex flex-col md:flex-row items-start justify-between gap-4 py-4 border-b md:border-0">
          <div className="space-y-1">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-5 w-32" />
          </div>
          <Skeleton className="h-11 w-full md:w-32" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-12 mt-8">
          {/* Left Column (Info) Skeleton */}
          <aside className="lg:col-span-1 space-y-8 mb-8 lg:mb-0">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-24" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-4">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-1" />
                  <Skeleton className="h-5 w-full" />
                </div>
                <div className="flex items-start gap-4">
                  <Phone className="h-5 w-5 text-muted-foreground mt-1" />
                  <Skeleton className="h-5 w-3/4" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent className="space-y-2">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <Skeleton className="h-5 w-12" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                {[Car, Wifi, Fan, Accessibility].map((Icon, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </aside>

          {/* Right Column (Services) Skeleton */}
          <main className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-4">
              <Skeleton className="h-8 w-32" />
            </h2>
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-6 w-48" />
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-full max-w-sm" />
                    </div>
                    <div className="w-full sm:w-auto">
                      <Skeleton className="h-10 w-full sm:w-28" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
