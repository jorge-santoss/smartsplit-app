export default function Skeleton({ className = '' }) {
  return (
    <div
      className={`animate-pulse bg-[#2C2C2E] rounded ${className}`}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-[#1C1C1E] border border-[#2C2C2E] shadow-xl shadow-black/50 rounded-2xl p-6 space-y-4">
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}