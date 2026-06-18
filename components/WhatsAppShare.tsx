'use client';

import { useTranslations } from 'next-intl';
import { waUrl } from '@/lib/whatsapp';
import { cn } from '@/lib/utils';
import { useSetting } from './SiteContentProvider';

/**
 * Single WhatsApp share button. The fully-rendered `message` is passed in
 * (templates are rendered server-side or in the admin menu).
 */
export default function WhatsAppShare({
  message,
  label,
  className,
}: {
  message: string;
  label?: string;
  className?: string;
}) {
  const t = useTranslations('WhatsApp');
  const showWhatsapp = useSetting('show_whatsapp');
  if (!showWhatsapp || process.env.NEXT_PUBLIC_WHATSAPP_ENABLED === 'false') return null;

  return (
    <a
      href={waUrl(message)}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 font-sans font-semibold text-white shadow-sm transition-transform hover:scale-105 active:scale-95',
        className
      )}
    >
      <span aria-hidden>🟢</span>
      {label ?? t('send')}
    </a>
  );
}
