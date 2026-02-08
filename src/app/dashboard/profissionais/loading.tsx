
import { Skeleton } from '@/components/ui/skeleton';

export default function ProfessionalsLoading() {
  return (
    <div className="flex flex-col gap-8 p-4 md:p-8 h-full">
      <header className="flex items-center gap-4">
        <Skeleton className="h-9 w-9 md:hidden" />
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">
        <div className="flex flex-col items-center gap-2 text-center">
            <Skeleton className="h-12 w-12 rounded-full" />
            <Skeleton className="h-7 w-48 mt-2" />
            <Skeleton className="h-4 w-72 mt-2" />
            <Skeleton className="h-10 w-40 mt-4" />
        </div>
      </main>
    </div>
  );
}
