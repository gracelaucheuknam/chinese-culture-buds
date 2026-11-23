import { useEffect, useRef, useState } from 'react';
import { playSfx } from '../engine/audio';
import styles from './ParentGate.module.css';

const HOLD_MS = 3000;
const RADIUS = 62;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

type Props = {
  open: boolean;
  title?: string;
  description?: string;
  onSuccess: () => void;
  onCancel: () => void;
};

export function ParentGate({
  open,
  title = '家長／老師專區',
  description = '請按住圓圈 3 秒進入（方便家長陪同時操作）。',
  onSuccess,
  onCancel,
}: Props) {
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const doneRef = useRef(false);

  const clear = () => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    startRef.current = null;
    setProgress(0);
  };

  useEffect(() => {
    if (!open) {
      doneRef.current = false;
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      startRef.current = null;
    }
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [open]);

  // Reset visual progress when dialog closes without setState-in-effect cascade.
  const shownProgress = open ? progress : 0;

  const tick = (now: number) => {
    if (startRef.current === null) startRef.current = now;
    const elapsed = now - startRef.current;
    const next = Math.min(1, elapsed / HOLD_MS);
    setProgress(next);
    if (next >= 1) {
      if (!doneRef.current) {
        doneRef.current = true;
        playSfx('success');
        onSuccess();
      }
      clear();
      return;
    }
    rafRef.current = requestAnimationFrame(tick);
  };

  const startHold = () => {
    if (doneRef.current) return;
    playSfx('tap');
    clear();
    doneRef.current = false;
    rafRef.current = requestAnimationFrame(tick);
  };

  const endHold = () => {
    if (progress < 1) clear();
  };

  if (!open) return null;

  const dashOffset = CIRCUMFERENCE * (1 - shownProgress);

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label={title}>
      <div className={styles.panel}>
        <h2>{title}</h2>
        <p>{description}</p>

        <button
          type="button"
          className={styles.hold}
          aria-label="按住三秒解鎖"
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            startHold();
          }}
          onPointerUp={endHold}
          onPointerCancel={endHold}
          onPointerLeave={endHold}
        >
          <svg className={styles.ring} viewBox="0 0 140 140" aria-hidden>
            <circle cx="70" cy="70" r={RADIUS} fill="none" stroke="#ffe0b0" strokeWidth="10" />
            <circle
              cx="70"
              cy="70"
              r={RADIUS}
              fill="none"
              stroke="#f5a623"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
            />
          </svg>
          <span className={styles.holdLabel}>{Math.ceil((1 - shownProgress) * 3) || '✓'}</span>
        </button>

        <button type="button" className={styles.cancel} onClick={onCancel}>
          取消
        </button>
      </div>
    </div>
  );
}
