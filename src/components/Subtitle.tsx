import { useEffect, useState } from 'react';
import { assets } from '../content/assets';
import { onSubtitle } from '../engine/audio';
import { useProgress } from '../engine/progress';
import styles from './Subtitle.module.css';

type Props = {
  /** Override live audio subtitle with a fixed string. */
  text?: string | null;
  /** Lift above bottom chrome (story controls, etc.). */
  offsetBottom?: number;
};

/** Reserved height so page actions stay above the panel. */
const SUBTITLE_RESERVE_PX = 132;

export function Subtitle({ text, offsetBottom = 16 }: Props) {
  const { state } = useProgress();
  const [live, setLive] = useState<string | null>(null);

  useEffect(() => onSubtitle(setLive), []);

  const content = text !== undefined ? text : live;
  const enabled = state.settings.subtitles;
  const visible = enabled && Boolean(content);

  useEffect(() => {
    const root = document.documentElement;
    // Always reserve space while subtitles are enabled so buttons never sit under the panel
    root.style.setProperty(
      '--subtitle-clearance',
      enabled ? `${SUBTITLE_RESERVE_PX}px` : '0px',
    );
    root.classList.toggle('has-subtitle', enabled);
    return () => {
      root.style.setProperty('--subtitle-clearance', '0px');
      root.classList.remove('has-subtitle');
    };
  }, [enabled]);

  return (
    <div
      className={[
        styles.bar,
        state.settings.whiteboardMode ? styles.whiteboard : '',
        visible ? '' : styles.hidden,
      ]
        .filter(Boolean)
        .join(' ')}
      role="status"
      aria-live="polite"
      style={{
        backgroundImage: `url(${assets.ui.panel})`,
        bottom: offsetBottom,
      }}
    >
      <span className={styles.text}>{content}</span>
    </div>
  );
}
