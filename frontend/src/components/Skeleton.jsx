export default function Skeleton({ className = '' }) {
  return (
    <div
      className={`animate-pulse bg-[#E1EEE8] rounded ${className}`}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white p-6 rounded-xl border border-[#E1EEE8] shadow-sm space-y-4">
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}