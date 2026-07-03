import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function DashboardSkeleton() {
  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-64 mt-2" />
      </div>

      <Skeleton className="h-28 w-full rounded-2xl" />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-16 w-full" />
        </Card>
        <Card>
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-16 w-full" />
        </Card>
      </div>
    </div>
  );
}
