
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function ServicesLoading() {
  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <header className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-80 mt-2" />
        </div>
        <Skeleton className="h-10 w-36" />
      </header>
      <main>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-start justify-between">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <div className="space-y-1">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                <Skeleton className="h-8 w-8" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-4" />
                 <div className="flex items-center justify-between border-t pt-4">
                    <div className="flex items-center space-x-2">
                        <Skeleton className="h-6 w-11 rounded-full" />
                        <Skeleton className="h-5 w-12" />
                    </div>
                    <Skeleton className="h-4 w-28" />
                 </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
