import { Link } from '@/i18n/routing';

interface FooterContent {
  tagline: string;
  rights: string;
}

export default function Footer({
  siteName,
  footer,
}: {
  siteName: string;
  footer: FooterContent;
}) {
  const year = new Date().getFullYear();
  return (
    <footer className="fabric-bg mt-16 border-t border-gold/30 text-cream">
      <div className="mx-auto max-w-6xl px-4 py-10 text-center">
        <p className="font-display text-2xl font-bold text-gold">{siteName}</p>
        {footer.tagline && <p className="mt-2 font-serif text-lg italic text-cream/90">{footer.tagline}</p>}
        <p className="mt-4 font-sans text-xs text-cream/50">
          © {year} {siteName} · {footer.rights}
        </p>
        <Link href="/admin" className="mt-3 inline-block font-sans text-[10px] text-cream/25 transition-colors hover:text-gold/70">
          Admin / ניהול
        </Link>
      </div>
    </footer>
  );
}
