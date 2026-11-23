import { useState } from 'react';
import styles from './SceneBackground.module.css';

type Props = {
  src?: string;
  /** How much the soft wash covers the picture so text and buttons stay readable (0–1). */
  wash?: number;
};

/**
 * Full-bleed picture behind a screen. If the picture is missing the screen keeps
 * its own gradient, so nothing breaks before the art is added.
 */
export function SceneBackground({ src, wash = 0.35 }: Props) {
  const [missing, setMissing] = useState(false);
  if (!src || missing) return null;
  return (
    <div className={styles.wrap} aria-hidden>
      <img
        className={styles.img}
        src={src}
        alt=""
        decoding="async"
        draggable={false}
        onError={() => setMissing(true)}
      />
      <div className={styles.wash} style={{ opacity: wash }} />
    </div>
  );
}
