import { cn } from '@/lib/utils';

/** A thin gold line with a central star ornament — section divider. */
export function FlourishDivider({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center justify-center gap-3', className)} aria-hidden>
      <span className="h-px w-12 bg-gradient-to-r from-transparent to-gold sm:w-20" />
      <svg width="20" height="20" viewBox="0 0 24 24" className="text-gold">
        <path
          d="M12 1.5 L13.8 9.6 L22.5 12 L13.8 14.4 L12 22.5 L10.2 14.4 L1.5 12 L10.2 9.6 Z"
          fill="currentColor"
        />
      </svg>
      <span className="h-px w-12 bg-gradient-to-l from-transparent to-gold sm:w-20" />
    </div>
  );
}

/** Decorative corner ornament for invitation cards. */
export function CornerFlourish({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 44 44" className={className} aria-hidden fill="none">
      <path d="M3 41 C3 20 20 3 41 3" stroke="currentColor" strokeWidth="1.1" />
      <path d="M3 32 C3 18 18 3 32 3" stroke="currentColor" strokeWidth="0.7" opacity="0.55" />
      <circle cx="41" cy="3" r="1.6" fill="currentColor" />
      <circle cx="3" cy="41" r="1.6" fill="currentColor" />
    </svg>
  );
}
