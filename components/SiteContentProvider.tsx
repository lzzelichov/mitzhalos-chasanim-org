'use client';

import { createContext, useContext } from 'react';

// Global on/off settings, loaded once in the layout and shared via context
// (no per-page refetch). Server components read getSiteContent() directly.
const SettingsContext = createContext<Record<string, boolean>>({});

export function SiteContentProvider({
  settings,
  children,
}: {
  settings: Record<string, boolean>;
  children: React.ReactNode;
}) {
  return <SettingsContext.Provider value={settings}>{children}</SettingsContext.Provider>;
}

export function useSetting(key: string, def = true): boolean {
  const s = useContext(SettingsContext);
  return key in s ? s[key] : def;
}
