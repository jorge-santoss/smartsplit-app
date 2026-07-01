export default function Skeleton({ className = '' }) {
  return (
    <div
      className={`animate-pulse bg-white/10 rounded ${className}`}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="backdrop-blur-xl bg-white/5 border border-white/10 shadow-lg rounded-2xl p-6 space-y-4">
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}