/** 6 cream shimmer cards while the weddings grid loads. */
export function WeddingsGridSkeleton() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-hidden>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={`wsk-${i}`} className="invite-card animate-pulse p-7">
          <div className="mx-auto h-3 w-20 rounded bg-burgundy/10" />
          <div className="mx-auto mt-3 h-7 w-3/4 rounded bg-burgundy/15" />
          <div className="mx-auto mt-3 h-4 w-1/2 rounded bg-charcoal/10" />
          <div className="gold-divider my-5 opacity-30" />
          <div className="h-2.5 w-full rounded-full bg-burgundy/10" />
          <div className="mt-5 h-9 w-full rounded-full bg-burgundy/15" />
        </div>
      ))}
    </div>
  );
}

/** 30 ghost tiles while the date grid (calendar) loads. */
export function DateGridSkeleton() {
  return (
    <div className="mx-auto w-full max-w-3xl" aria-hidden>
      <div className="mx-auto mb-5 h-8 w-48 animate-pulse rounded bg-burgundy/10" />
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {Array.from({ length: 30 }).map((_, i) => (
          <div key={`dsk-${i}`} className="aspect-square animate-pulse rounded-xl border border-dashed border-gold/30 bg-cream" />
        ))}
      </div>
    </div>
  );
}
