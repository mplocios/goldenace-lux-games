import { Skeleton } from "@/components/ui/skeleton";

export function GameCardSkeleton() {
  return (
    <div className="aspect-[3/4] w-full overflow-hidden rounded-xl border border-border/60 bg-card">
      <Skeleton className="h-full w-full rounded-none bg-gradient-to-br from-secondary/40 to-card" />
    </div>
  );
}

export function GameRowSkeleton({ count = 6 }: { count?: number }) {
  return (
    <section className="space-y-4" aria-busy="true" aria-live="polite">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-3 w-56" />
        </div>
      </div>
      <div className="-mx-4 flex gap-3 overflow-hidden px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="w-40 shrink-0 sm:w-auto">
            <GameCardSkeleton />
          </div>
        ))}
      </div>
    </section>
  );
}