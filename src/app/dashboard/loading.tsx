
import { Skeleton } from '@/components/ui/skeleton';
import {
  Card,
  CardContent,
  CardHeader
} from '@/components/ui/card';

export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-9 md:hidden" />
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
        </div>
        <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
            <div className="flex items-center gap-1">
                <Skeleton className="h-9 w-16" />
                <Skeleton className="h-9 w-16" />
                <Skeleton className="h-9 w-24" />
            </div>
            <Skeleton className="h-9 w-full sm:w-[280px]" />
            <div className="flex items-center gap-2">
                <Skeleton className="h-10 w-full sm:w-44" />
                <Skeleton className="h-10 w-10 rounded-full" />
            </div>
        </div>
      </header>

      <main className="grid flex-1 items-start gap-4 sm:gap-6 lg:gap-8">
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-8 w-10" />
            </CardContent>
          </Card>
           <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-8 w-8" />
            </CardContent>
          </Card>
           <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-8 w-6" />
            </CardContent>
          </Card>
           <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-8 w-6" />
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardHeader>
                <Skeleton className="h-4 w-40" />
            </CardHeader>
            <CardContent className="space-y-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
            </CardContent>
          </Card>
          <Card className="lg:col-span-2">
            <CardHeader>
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-48 mt-2" />
            </CardHeader>
            <CardContent className="flex items-center pt-2">
              <Skeleton className="h-3 w-full" />
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-1 md:col-span-4">
            <CardHeader>
              <Skeleton className="h-6 w-56" />
            </CardHeader>
            <CardContent className="h-[300px] pl-2">
              <Skeleton className="h-full w-full" />
            </CardContent>
          </Card>

          <Card className="col-span-1 md:col-span-4 lg:col-span-3">
            <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64 mt-2" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center gap-4">
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-8 w-8" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
