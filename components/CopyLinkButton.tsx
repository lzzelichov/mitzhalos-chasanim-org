'use client';

import { useState } from 'react';

export default function CopyLinkButton({
  url,
  label,
  copiedLabel,
}: {
  url: string;
  label: string;
  copiedLabel: string;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          /* clipboard unavailable */
        }
      }}
      className="btn-ghost !px-3 !py-1.5 text-xs"
    >
      {copied ? `✓ ${copiedLabel}` : `🔗 ${label}`}
    </button>
  );
}
