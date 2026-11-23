import { AnimatePresence, motion } from 'framer-motion';
import type { ReactNode } from 'react';

type Props = {
  routeKey: string;
  children: ReactNode;
};

/** Soft fade between hash routes without blocking the next screen (avoids blank waits). */
export function ScreenTransition({ routeKey, children }: Props) {
  return (
    <AnimatePresence initial={false}>
      <motion.div
        key={routeKey}
        className="route-layer"
        style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
