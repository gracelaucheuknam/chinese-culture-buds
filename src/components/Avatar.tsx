import { motion, type TargetAndTransition } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { avatarHeadSrc, zodiacSrc, type ZodiacPose } from '../content/assets';
import type { Gender, HeadId, OutfitId } from '../content/types';
import { playSfx } from '../engine/audio';
import styles from './Avatar.module.css';

export type AvatarPose = ZodiacPose | 'walk';

type Props = {
  head: HeadId;
  /** Kept for backward compatibility with saved profiles; no longer affects the picture. */
  gender?: Gender;
  /** Kept for backward compatibility; each zodiac is one standalone picture. */
  outfit?: OutfitId;
  size?: number;
  className?: string;
  /** Celebrate once on mount (e.g. right after the child picks their zodiac). */
  spinning?: boolean;
  /** Force a pose; otherwise the character lives on its own (idle, waves now and then). */
  pose?: AvatarPose;
  /** Tapping makes the character jump and cheer. Off inside other buttons. */
  interactive?: boolean;
};

const motionFor: Record<AvatarPose, TargetAndTransition> = {
  idle: {
    y: 0,
    scaleY: [1, 0.97, 1],
    scaleX: [1, 1.02, 1],
    rotate: [0, -2, 0, 2, 0],
    transition: { duration: 3.2, repeat: Infinity, ease: 'easeInOut' },
  },
  wave: {
    rotate: [0, -6, 6, -4, 0],
    y: [0, -6, 0],
    transition: { duration: 0.9, repeat: Infinity, ease: 'easeInOut' },
  },
  cheer: {
    y: [0, -28, 0, -14, 0],
    scaleY: [1, 1.06, 0.94, 1.03, 1],
    rotate: [0, -5, 5, 0],
    transition: { duration: 0.8, repeat: Infinity, ease: 'easeOut' },
  },
  walk: {
    y: [0, -12, 0],
    rotate: [-5, 5, -5],
    transition: { duration: 0.42, repeat: Infinity, ease: 'easeInOut' },
  },
};

/** Pose pictures that actually loaded; a missing pose shows the standing picture, then the old round head. */
function useZodiacPictures(head: HeadId) {
  const [failed, setFailed] = useState<Record<string, true>>({});
  useEffect(() => setFailed({}), [head]);
  const idle = failed[zodiacSrc(head, 'idle')] ? avatarHeadSrc(head) : zodiacSrc(head, 'idle');
  const srcFor = (p: ZodiacPose) => {
    if (p === 'idle') return idle;
    const s = zodiacSrc(head, p);
    return failed[s] ? idle : s;
  };
  const fail = (src: string) => setFailed((f) => (f[src] ? f : { ...f, [src]: true }));
  return { srcFor, fail };
}

const LAYERS: ZodiacPose[] = ['idle', 'wave', 'cheer'];

export function Avatar({
  head,
  size = 160,
  className = '',
  spinning = false,
  pose,
  interactive = true,
}: Props) {
  const [autoPose, setAutoPose] = useState<AvatarPose>(spinning ? 'cheer' : 'idle');
  const timers = useRef<number[]>([]);
  const current = pose ?? autoPose;
  const { srcFor, fail } = useZodiacPictures(head);
  const shown: ZodiacPose = current === 'walk' ? 'idle' : current;
  const shownSrc = srcFor(shown);

  useEffect(() => {
    const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));
    if (spinning) later(() => setAutoPose('idle'), 1800);
    // Come alive: wave every few seconds, like the guides do
    const loop = window.setInterval(
      () => {
        setAutoPose((p) => (p === 'idle' ? 'wave' : p));
        later(() => setAutoPose((p) => (p === 'wave' ? 'idle' : p)), 1600);
      },
      5200 + Math.round(Math.random() * 2400),
    );
    const list = timers.current;
    return () => {
      window.clearInterval(loop);
      list.forEach((t) => window.clearTimeout(t));
    };
  }, [spinning]);

  const tap = () => {
    if (!interactive || pose) return;
    playSfx('snap');
    setAutoPose('cheer');
    timers.current.push(window.setTimeout(() => setAutoPose('idle'), 1400));
  };

  return (
    <div
      className={[styles.wrap, interactive && !pose ? styles.tappable : '', className]
        .filter(Boolean)
        .join(' ')}
      style={{ width: size, height: size }}
      onClick={tap}
      aria-hidden
    >
      <span className={styles.shadow} />
      {/* Every pose is mounted and decoded up front; switching pose only flips which one is
          visible, so the picture never fades or blinks (same feel as the festival guides). */}
      <motion.div
        className={styles.stage}
        style={{ originY: 1 }}
        initial={spinning ? { scale: 0.6, y: 20 } : false}
        animate={{ scale: 1, ...motionFor[current] }}
      >
        {[...new Set(LAYERS.map(srcFor))].map((s) => (
          <img
            key={s}
            className={styles.img}
            src={s}
            alt=""
            width={size}
            height={size}
            decoding="async"
            draggable={false}
            onError={() => fail(s)}
            style={{ visibility: s === shownSrc ? 'visible' : 'hidden' }}
          />
        ))}
      </motion.div>
    </div>
  );
}
