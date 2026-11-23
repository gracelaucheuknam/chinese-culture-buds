import { useEffect, useRef } from 'react';

const DEFAULT_IDLE_MS = 8000;

type Options = {
  enabled?: boolean;
  idleMs?: number;
  onIdle: () => void;
};

/**
 * After `idleMs` without pointer/keyboard activity, call onIdle once,
 * then keep re-firing on each subsequent idle window.
 */
export function useIdleHint({ enabled = true, idleMs = DEFAULT_IDLE_MS, onIdle }: Options): void {
  const onIdleRef = useRef(onIdle);

  useEffect(() => {
    onIdleRef.current = onIdle;
  }, [onIdle]);

  useEffect(() => {
    if (!enabled) return;

    let timer: number | undefined;

    const reset = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        onIdleRef.current();
      }, idleMs);
    };

    const events: Array<keyof WindowEventMap> = [
      'pointerdown',
      'pointermove',
      'keydown',
      'touchstart',
      'wheel',
    ];

    for (const event of events) {
      window.addEventListener(event, reset, { passive: true });
    }
    reset();

    return () => {
      window.clearTimeout(timer);
      for (const event of events) {
        window.removeEventListener(event, reset);
      }
    };
  }, [enabled, idleMs]);
}
