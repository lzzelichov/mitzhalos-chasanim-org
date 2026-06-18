import Image from 'next/image';
import ChuppaSvg from './ChuppaSvg';
import { HERO_BG, PAGE_HERO, type HeroKey } from '@/lib/backgrounds';
import { cn } from '@/lib/utils';

const PETALS = Array.from({ length: 14 });

// Tiny burgundy SVG used as the blur placeholder while the hero photo loads.
const BLUR = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="9"><rect width="16" height="9" fill="#5e1730"/></svg>'
)}`;

/**
 * Full-bleed hero: optimized Jerusalem photo (next/image, AVIF/WebP, priority,
 * blur placeholder) + burgundy overlay + glowing chuppa + falling rose petals.
 */
export default function HeroBackground({
  image,
  children,
  className,
  showChuppa = true,
  priority = true,
}: {
  image: HeroKey | string;
  children?: React.ReactNode;
  className?: string;
  showChuppa?: boolean;
  priority?: boolean;
}) {
  const key: HeroKey | undefined =
    image in HERO_BG ? (image as HeroKey) : PAGE_HERO[image as string];
  const src = key ? HERO_BG[key] : image;

  return (
    <section className={cn('relative isolate overflow-hidden rounded-3xl', className)}>
      <Image
        src={src}
        alt=""
        fill
        priority={priority}
        sizes="100vw"
        placeholder="blur"
        blurDataURL={BLUR}
        className="-z-20 object-cover"
      />
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            'linear-gradient(180deg, rgba(122,31,61,0.60) 0%, rgba(94,23,48,0.74) 100%)',
        }}
      />

      <div className="petals" aria-hidden>
        {PETALS.map((_, i) => {
          const size = 7 + (i % 4) * 3;
          return (
            <span
              key={i}
              className="petal"
              style={{
                left: `${(i * 7 + 3) % 100}%`,
                width: `${size}px`,
                height: `${size}px`,
                animationDuration: `${8 + (i % 5) * 2}s`,
                animationDelay: `${(i % 7) * 1.3}s`,
              }}
            />
          );
        })}
      </div>

      {showChuppa && (
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-0 -translate-x-1/2 -translate-y-1/2">
          <ChuppaSvg className="chuppa-glow animate-glow-pulse w-[min(80%,460px)] opacity-45" />
        </div>
      )}

      <div className="relative z-10">{children}</div>
    </section>
  );
}
