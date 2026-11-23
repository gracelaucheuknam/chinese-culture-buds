import { useEffect, useState } from 'react';
import { assets } from '../content/assets';
import { GuideLineup } from './GuideLineup';
import styles from './LoadingScreen.module.css';

type BootProps = {
  minMs?: number;
};

type OverlayProps = {
  label?: string;
};

/** Reusable full-screen loader (theme preload / Suspense). */
export function LoadingOverlay({ label = '載入緊…' }: OverlayProps) {
  return (
    <div
      className={styles.overlay}
      aria-busy="true"
      role="status"
      style={{ backgroundImage: `linear-gradient(rgba(255,246,232,0.55), rgba(255,246,232,0.55)), url("${assets.screens.cover}")` }}
    >
      <div className={styles.brand}>童心樂中華</div>
      <div className={styles.bar}>
        <div className={styles.fill} />
      </div>
      <p className={styles.hint}>{label}</p>
      <GuideLineup />
    </div>
  );
}

/** Brief splash while fonts / first paint settle. */
export function LoadingScreen({ minMs = 900 }: BootProps) {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const start = performance.now();
    let cancelled = false;

    const finish = () => {
      if (cancelled) return;
      const wait = Math.max(0, minMs - (performance.now() - start));
      window.setTimeout(() => {
        setFading(true);
        window.setTimeout(() => setVisible(false), 450);
      }, wait);
    };

    // Warm shared chrome early
    void import('../engine/preload').then(({ preloadImages, themeAssetUrls }) =>
      preloadImages(themeAssetUrls('map')),
    );

    if (document.fonts?.ready) {
      void document.fonts.ready.then(finish).catch(finish);
    } else {
      finish();
    }

    try {
      window.speechSynthesis?.getVoices();
    } catch {
      /* ignore */
    }

    return () => {
      cancelled = true;
    };
  }, [minMs]);

  if (!visible) return null;

  return (
    <div
      className={[styles.overlay, fading ? styles.fadeOut : ''].join(' ')}
      aria-busy="true"
      style={{ backgroundImage: `linear-gradient(rgba(255,246,232,0.55), rgba(255,246,232,0.55)), url("${assets.screens.cover}")` }}
    >
      <div className={styles.brand}>童心樂中華</div>
      <div className={styles.bar}>
        <div className={styles.fill} />
      </div>
      <p className={styles.hint}>載入緊…</p>
      <GuideLineup />
    </div>
  );
}
