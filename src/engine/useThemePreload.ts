import { useEffect, useState } from 'react';
import { ensureThemeAssets, isThemeCached } from './preload';

const MIN_MS = 320;

/** Gate theme/activity screens until theme WebPs are warm in cache. */
export function useThemePreload(themeId: string): boolean {
  const [ready, setReady] = useState(() => isThemeCached(themeId));

  useEffect(() => {
    if (isThemeCached(themeId)) {
      setReady(true);
      return;
    }

    setReady(false);
    let cancelled = false;
    const start = performance.now();

    void ensureThemeAssets(themeId).then(() => {
      if (cancelled) return;
      const wait = Math.max(0, MIN_MS - (performance.now() - start));
      window.setTimeout(() => {
        if (!cancelled) setReady(true);
      }, wait);
    });

    return () => {
      cancelled = true;
    };
  }, [themeId]);

  return ready;
}
