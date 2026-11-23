import { AnimatePresence, motion, type TargetAndTransition } from 'framer-motion';
import {
  guideInfo,
  guidePoseSrc,
  type GuideCharacterId,
  type GuidePoseId,
} from '../content/assets';
import { useState } from 'react';
import { playSfx } from '../engine/audio';
import styles from './Guide.module.css';

export type GuideId = GuideCharacterId;
export type GuidePose = GuidePoseId;

type Props = {
  id: GuideId;
  pose?: GuidePose;
  size?: number;
  showName?: boolean;
  onClick?: () => void;
};

const NAMES: Record<GuideId, string> = {
  puff: '胖胖',
  dongdong: '咚咚',
  houyi: '后羿',
  change: '嫦娥',
  quyuan: '屈原',
  caicai: '彩彩',
  baobao: '包包',
};

const poseAnim: Record<GuidePose, TargetAndTransition> = {
  idle: {
    scale: [1, 1.02, 1],
    transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
  },
  talk: {
    y: [0, -5, 0, -3, 0],
    transition: { duration: 0.7, repeat: Infinity, ease: 'easeInOut' },
  },
  welcome: {
    y: [0, -10, 0, -6, 0],
    rotate: [0, -4, 4, 0],
    scale: [1, 1.05, 1],
    transition: { duration: 0.9, repeat: Infinity, ease: 'easeInOut' },
  },
  cheer: {
    scale: [1, 1.06, 1],
    y: [0, -4, 0],
    transition: { duration: 0.65, repeat: Infinity },
  },
  hint: {
    rotate: [0, -8, -4, -8],
    transition: { duration: 1.2, repeat: Infinity, ease: 'easeInOut' },
  },
  tilt: {
    rotate: [0, -8, -4, -8],
    transition: { duration: 1.2, repeat: Infinity, ease: 'easeInOut' },
  },
};

const CONFETTI = ['#f5a623', '#e85d4c', '#5bbf7a', '#5b8def', '#f7d06a'];
const CROSSFADE_MS = 0.15;

export function Guide({
  id,
  pose = 'idle',
  size = 140,
  showName = false,
  onClick,
}: Props) {
  // New guides fall back to the older guide's picture until their art is added
  const [missing, setMissing] = useState(false);
  const fallbackId = (guideInfo as Record<string, { fallback: GuideCharacterId }>)[id]?.fallback;
  const src = missing && fallbackId ? guidePoseSrc(fallbackId, pose) : guidePoseSrc(id, pose);
  const showConfetti = pose === 'cheer';

  return (
    <button
      type="button"
      className={styles.wrap}
      style={{ width: size, height: size + (showName ? 28 : 0) }}
      aria-label={NAMES[id]}
      onClick={() => {
        playSfx('tap');
        onClick?.();
      }}
    >
      <motion.div
        className={styles.stage}
        style={{ width: size, height: size }}
        animate={poseAnim[pose]}
      >
        {/* Crossfade: old + new overlap; no empty transparent frame */}
        <AnimatePresence initial={false}>
          <motion.img
            key={src}
            className={styles.img}
            src={src}
            alt=""
            width={size}
            height={size}
            decoding="async"
            draggable={false}
            onError={() => setMissing(true)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: CROSSFADE_MS, ease: 'easeInOut' }}
          />
        </AnimatePresence>
        {showConfetti && (
          <div className={styles.confetti} aria-hidden>
            {CONFETTI.map((color, i) => (
              <motion.span
                key={color}
                className={styles.confettiBit}
                style={{ background: color, left: `${12 + i * 18}%` }}
                animate={{ y: [0, -36 - i * 4, 8], opacity: [0, 1, 0], rotate: [0, 120] }}
                transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.08 }}
              />
            ))}
          </div>
        )}
      </motion.div>
      {showName && <span className={styles.label}>{NAMES[id]}</span>}
    </button>
  );
}
