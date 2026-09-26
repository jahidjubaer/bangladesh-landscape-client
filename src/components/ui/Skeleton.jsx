// Skeleton loaders — use instead of spinners for content that has a shape.

export function Skeleton({ className = '' }) {
  return <div className={`skeleton ${className}`}></div>;
}

export function SkeletonCard() {
  return (
    <div className="card bg-base-100 shadow-md">
      <Skeleton className="h-44 rounded-b-none" />
      <div className="card-body p-5 gap-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 6, cols = 'sm:grid-cols-2 lg:grid-cols-3' }) {
  return (
    <div className={`grid gap-6 ${cols}`}>
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonList({ count = 4 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="card bg-base-100 shadow-md p-5 flex-row items-center gap-4">
          <Skeleton className="w-12 h-12 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
