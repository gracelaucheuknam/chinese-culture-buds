import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { assets } from '../content/assets';
import styles from './GuideLineup.module.css';

const c = assets.characters;

/** The four festival guides: 胖胖 中秋, 咚咚 端午, 彩彩 新年, 包包 飲茶. */
const GUIDES = [
  { id: 'puff', name: '胖胖', pics: c.puff },
  { id: 'dongdong', name: '咚咚', pics: c.dongdong },
  { id: 'caicai', name: '彩彩', pics: c.caicai },
  { id: 'baobao', name: '包包', pics: c.baobao },
] as const;

type Pose = 'stand' | 'wave' | 'clap';
const POSES: Pose[] = ['stand', 'wave', 'clap'];

const moveFor: Record<Pose, object> = {
  stand: { y: [0, -6, 0], rotate: 0, transition: { duration: 2.4, repeat: Infinity, ease: 'easeInOut' } },
  wave: { y: [0, -14, 0], rotate: [0, -4, 4, 0], transition: { duration: 0.9, repeat: Infinity, ease: 'easeInOut' } },
  clap: { y: [0, -22, 0], scale: [1, 1.04, 1], transition: { duration: 0.7, repeat: Infinity, ease: 'easeOut' } },
};

function LineupGuide({ pics, delay }: { pics: Record<Pose, string>; delay: number }) {
  const [pose, setPose] = useState<Pose>('wave');

  // Each guide changes pose on its own beat, like they're greeting the child
  useEffect(() => {
    let t = 0;
    const next = (p: Pose) => {
      setPose(p);
      t = window.setTimeout(
        () => next(POSES[(POSES.indexOf(p) + 1 + Math.floor(Math.random() * 2)) % POSES.length]),
        1800 + Math.random() * 1600,
      );
    };
    t = window.setTimeout(() => next('stand'), 1200 + delay * 500);
    return () => window.clearTimeout(t);
  }, [delay]);

  return (
    <motion.div
      className={styles.guide}
      style={{ originY: 1 }}
      initial={{ y: '60%' }}
      animate={{ y: '0%', transition: { type: 'spring', stiffness: 180, damping: 16, delay: delay * 0.12 } }}
    >
      <motion.div className={styles.stage} style={{ originY: 1 }} animate={moveFor[pose] as never}>
        {/* all poses stay mounted; only visibility flips, so nothing fades or blinks */}
        {POSES.map((p) => (
          <img
            key={p}
            src={pics[p]}
            alt=""
            decoding="async"
            draggable={false}
            style={{ visibility: p === pose ? 'visible' : 'hidden' }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
}

/** Big guides standing along the bottom edge of the start / loading screens. */
export function GuideLineup() {
  return (
    <div className={styles.lineup} aria-hidden>
      {GUIDES.map((g, i) => (
        <LineupGuide key={g.id} pics={g.pics} delay={i} />
      ))}
    </div>
  );
}
