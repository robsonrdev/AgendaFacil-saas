
import { Skeleton } from '@/components/ui/skeleton';
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function AppointmentsLoading() {
  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <header className="flex flex-col items-stretch gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
            <Skeleton className="h-9 w-9 md:hidden" />
            <div>
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-72 mt-2" />
            </div>
        </div>
        <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-28" />
            <Skeleton className="h-10 w-44" />
        </div>
      </header>
      <main>
        <Card>
          <CardHeader>
             <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <Skeleton className="h-6 w-56" />
                <div className="flex items-center gap-2 w-full max-w-2xl">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead><Skeleton className="h-5 w-16" /></TableHead>
                        <TableHead><Skeleton className="h-5 w-24" /></TableHead>
                        <TableHead><Skeleton className="h-5 w-20" /></TableHead>
                        <TableHead className="text-center"><Skeleton className="h-5 w-16 mx-auto" /></TableHead>
                        <TableHead className="text-right"><Skeleton className="h-5 w-12 ml-auto" /></TableHead>
                        <TableHead className="text-right"><Skeleton className="h-5 w-14 ml-auto" /></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                            <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                            <TableCell>
                                <Skeleton className="h-5 w-32" />
                                <Skeleton className="h-3 w-24 mt-2" />
                            </TableCell>
                            <TableCell>
                                <Skeleton className="h-5 w-28" />
                                <Skeleton className="h-3 w-16 mt-2" />
                            </TableCell>
                            <TableCell className="text-center"><Skeleton className="h-6 w-24 mx-auto rounded-full" /></TableCell>
                            <TableCell className="text-right"><Skeleton className="h-5 w-10 ml-auto" /></TableCell>
                         <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
