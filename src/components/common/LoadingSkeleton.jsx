export function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-md bg-soft ${className}`} aria-hidden="true" />;
}

export default function LoadingSkeleton({ rows = 4 }) {
  return (
    <div className="space-y-6" role="status" aria-label="Loading">
      <div className="space-y-2">
        <Skeleton className="h-7 w-64" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
      <div className="card p-5">
        <div className="space-y-3">
          {Array.from({ length: rows }).map((_, i) => (
            <Skeleton key={i} className="h-9" />
          ))}
        </div>
      </div>
    </div>
  );
}
