import { waUrl } from '@/lib/whatsapp';

export default function WhatsAppShare({ text, label }: { text: string; label: string }) {
  return (
    <a
      href={waUrl(text)}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center gap-2 rounded-full border border-green-600/40 bg-green-50 px-5 py-2.5 font-sans font-medium text-green-700 transition-colors hover:bg-green-100"
    >
      <span aria-hidden>💬</span>
      {label}
    </a>
  );
}
