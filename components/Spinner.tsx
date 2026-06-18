export default function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-burgundy/70">
      <span className="h-6 w-6 animate-spin rounded-full border-2 border-gold border-t-transparent" />
      {label && <span className="font-sans text-sm">{label}</span>}
    </div>
  );
}
