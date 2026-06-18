import Image from 'next/image';
import type { OrgPhoto } from '@/lib/types';

export default function PhotoGallery({ photos }: { photos: OrgPhoto[] }) {
  if (!photos.length) return null;
  return (
    <div className="columns-2 gap-4 md:columns-3 [&>*]:mb-4">
      {photos.map((p) => (
        <figure key={p.id} className="break-inside-avoid overflow-hidden rounded-xl border border-gold/30 bg-white">
          {/* SITE POLICY: no photos of women — landscapes, men, clothing, synagogues only. */}
          <Image src={p.url} alt={p.caption || ''} width={500} height={500} className="h-auto w-full object-cover" />
          {p.caption && <figcaption className="p-2 text-center font-sans text-xs text-charcoal/60">{p.caption}</figcaption>}
        </figure>
      ))}
    </div>
  );
}
