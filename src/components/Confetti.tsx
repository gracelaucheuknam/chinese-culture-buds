import { AnimatePresence, motion } from 'framer-motion';
import { useMemo } from 'react';
import styles from './Confetti.module.css';

const COLORS = ['#f5a623', '#e85d4c', '#4caf7a', '#7ec8e3', '#ffd76a', '#ff8fab'];

type Props = {
  active: boolean;
  count?: number;
};

export function Confetti({ active, count = 36 }: Props) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: `${(i * 37) % 100}%`,
        delay: (i % 8) * 0.05,
        duration: 1.4 + (i % 5) * 0.15,
        color: COLORS[i % COLORS.length],
        rotate: (i * 47) % 360,
        x: ((i * 13) % 40) - 20,
      })),
    [count],
  );

  return (
    <div className={styles.layer} aria-hidden>
      <AnimatePresence>
        {active &&
          pieces.map((p) => (
            <motion.span
              key={p.id}
              className={styles.piece}
              style={{ left: p.left, background: p.color }}
              initial={{ y: -20, opacity: 1, rotate: 0, x: 0 }}
              animate={{
                y: '110vh',
                opacity: [1, 1, 0],
                rotate: p.rotate,
                x: p.x,
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: p.duration,
                delay: p.delay,
                ease: 'easeOut',
              }}
            />
          ))}
      </AnimatePresence>
    </div>
  );
}
