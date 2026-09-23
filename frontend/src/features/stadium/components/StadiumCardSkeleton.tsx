import { Card } from "../../../components/ui/Card";
import { Skeleton } from "../../../components/ui/Skeleton";

export function StadiumCardSkeleton() {
  return (
    <Card className="overflow-hidden" aria-hidden="true">
      <Skeleton className="h-[150px] rounded-none" />

      <div className="p-4">
        <div className="flex justify-between gap-4">
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-4 w-12" />
        </div>

        <Skeleton className="mt-3 h-3 w-1/3" />

        <div className="mt-4 flex gap-2">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-5 w-5" />
        </div>

        <div className="mt-5 flex items-center justify-between">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-9 w-16 rounded-lg" />
        </div>
      </div>
    </Card>
  );
}
