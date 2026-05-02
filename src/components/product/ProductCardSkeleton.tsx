export function ProductCardSkeleton() {
  return (
    <div className="card overflow-hidden bg-white">
      <div className="aspect-4/5 skeleton" />
      <div className="p-3 space-y-2">
        <div className="skeleton h-3 w-16 rounded-full" />
        <div className="skeleton h-4 w-full rounded-lg" />
        <div className="skeleton h-4 w-3/4 rounded-lg" />
        <div className="flex gap-1 mt-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton w-3 h-3 rounded-full" />
          ))}
        </div>
        <div className="skeleton h-5 w-20 rounded-lg" />
      </div>
    </div>
  );
}
