import { motion } from 'framer-motion';
import { assets } from '../content/assets';
import { navigate } from '../engine/routing';
import { BigButton } from './BigButton';
import { Confetti } from './Confetti';
import styles from './StickerReward.module.css';

type Props = {
  open: boolean;
  themeId: string;
  title: string;
};

export function StickerReward({ open, title }: Props) {
  if (!open) return null;

  return (
    <div className={styles.overlay} role="dialog" aria-label="通關貼紙">
      <Confetti active />
      <motion.img
        className={styles.sticker}
        src={assets.ui.medal}
        alt=""
        decoding="async"
        draggable={false}
        initial={{ scale: 0.2, rotate: -20, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 220, damping: 16 }}
      />
      <p className={styles.title}>{title}</p>
      <div className={styles.actions}>
        <BigButton onClick={() => navigate({ name: 'stickers' })}>睇貼紙簿</BigButton>
        <BigButton variant="secondary" onClick={() => navigate({ name: 'map' })}>
          返地圖
        </BigButton>
      </div>
    </div>
  );
}
