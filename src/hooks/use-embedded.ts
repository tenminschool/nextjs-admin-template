'use client';

import { useSyncExternalStore } from 'react';
import { useSearchParams } from 'next/navigation';

function subscribe() {
  // Whether we sit in a frame is fixed for the document's lifetime.
  return () => {};
}

const isFramed = () => window.self !== window.top;

/**
 * True when this app runs inside a host shell — the 10MS HQ iframe, or any
 * launcher that appends `?source=hq`. The host supplies its own navbar and
 * account menu, so the app drops its own instead of stacking two.
 *
 * Reads as `false` on the server and during hydration, then syncs to the real
 * answer — the frame check has no server-side equivalent, so treating it as
 * standalone until proven otherwise is the only markup both sides can agree on.
 */
export function useIsEmbedded(): boolean {
  const searchParams = useSearchParams();
  const framed = useSyncExternalStore(subscribe, isFramed, () => false);

  return searchParams.get('source') === 'hq' || framed;
}
