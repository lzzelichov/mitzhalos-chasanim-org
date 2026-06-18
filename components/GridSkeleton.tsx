export default function GridSkeleton() {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="mx-auto mb-8 h-12 w-full max-w-3xl rounded-full bg-navy/5" />
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 sm:gap-4 md:grid-cols-6">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="aspect-square rounded-2xl bg-gradient-to-br from-navy/5 to-navy/10
                       bg-[length:200%_100%] animate-shimmer"
          />
        ))}
      </div>
    </div>
  );
}
