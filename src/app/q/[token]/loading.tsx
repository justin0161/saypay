import { CardSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading your quote">
      <div className="bg-night">
        <div className="mx-auto max-w-2xl space-y-4 px-4 pt-5 pb-6">
          <div className="flex items-center gap-3">
            <div className="size-12 animate-pulse rounded-2xl bg-white/15" />
            <div className="h-5 w-40 animate-pulse rounded bg-white/15" />
          </div>
          <div className="h-8 w-3/4 animate-pulse rounded bg-white/15" />
          <div className="h-16 animate-pulse rounded-2xl bg-white/10" />
        </div>
      </div>
      <div className="mx-auto max-w-2xl space-y-4 px-4 py-4">
        <CardSkeleton lines={5} />
        <Skeleton className="h-32 rounded-card" />
      </div>
    </div>
  );
}
