import { cn } from "./cn";

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("animate-pulse rounded-2xl bg-raised", className)} />;
}

export function CardSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="rounded-card bg-surface p-5 shadow-card">
      <Skeleton className="h-5 w-2/5" />
      <div className="mt-4 space-y-2.5">
        {Array.from({ length: lines }, (_, i) => (
          <Skeleton key={i} className={cn("h-4", i === lines - 1 ? "w-3/5" : "w-full")} />
        ))}
      </div>
    </div>
  );
}
