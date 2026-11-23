import { useState, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { assets } from '../content/assets';
import { playSfx } from '../engine/audio';
import { useProgress } from '../engine/progress';
import styles from './BigButton.module.css';

type Variant = 'primary' | 'secondary' | 'ghost';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: Variant;
  playTap?: boolean;
};

export function BigButton({
  children,
  variant = 'primary',
  playTap = true,
  className = '',
  onClick,
  onPointerDown,
  onPointerUp,
  onPointerLeave,
  onPointerCancel,
  ...rest
}: Props) {
  const { state } = useProgress();
  const [pressed, setPressed] = useState(false);
  const variantClass =
    variant === 'secondary' ? styles.secondary : variant === 'ghost' ? styles.ghost : '';

  return (
    <button
      type="button"
      className={[
        styles.button,
        variantClass,
        state.settings.whiteboardMode ? styles.whiteboard : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      onPointerDown={(e) => {
        setPressed(true);
        onPointerDown?.(e);
      }}
      onPointerUp={(e) => {
        setPressed(false);
        onPointerUp?.(e);
      }}
      onPointerLeave={(e) => {
        setPressed(false);
        onPointerLeave?.(e);
      }}
      onPointerCancel={(e) => {
        setPressed(false);
        onPointerCancel?.(e);
      }}
      onClick={(e) => {
        if (playTap) playSfx('tap');
        onClick?.(e);
      }}
      {...rest}
    >
      {variant === 'primary' && (
        <img
          className={styles.skin}
          src={pressed ? assets.ui.buttonPressed : assets.ui.button}
          alt=""
          decoding="async"
          draggable={false}
        />
      )}
      {variant === 'secondary' && (
        <img
          className={styles.skin}
          src={assets.ui.card}
          alt=""
          decoding="async"
          draggable={false}
        />
      )}
      <span className={styles.label}>{children}</span>
    </button>
  );
}
