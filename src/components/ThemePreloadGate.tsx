import type { ReactNode } from 'react';
import { useThemePreload } from '../engine/useThemePreload';
import { LoadingOverlay } from './LoadingScreen';

type Props = {
  themeId: string;
  children: ReactNode;
};

/** Hold the route behind LoadingOverlay until theme WebPs are cached. */
export function ThemePreloadGate({ themeId, children }: Props) {
  const ready = useThemePreload(themeId);
  if (!ready) return <LoadingOverlay label="準備主題畫面…" />;
  return children;
}
