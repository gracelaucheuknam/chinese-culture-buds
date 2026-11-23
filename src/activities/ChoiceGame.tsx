import type { FestivalGuideId } from '../content/assets';
import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { ArtOrLabel } from '../components/ArtOrLabel';
import { BigButton } from '../components/BigButton';
import { Confetti } from '../components/Confetti';
import { Guide } from '../components/Guide';
import { Subtitle } from '../components/Subtitle';
import { TopBar } from '../components/TopBar';
import { playLine, playSfx, speakText } from '../engine/audio';
import { useProgress } from '../engine/progress';
import { useIdleHint } from '../engine/useIdleHint';
import styles from './ChoiceGame.module.css';

export type ChoiceOption = {
  id: string;
  /** Spoken (and shown on the placeholder card) when tapped. */
  label: { yue: string; pu: string };
  img: string;
};

export type ChoiceRound = {
  /** Narration line asking the question, e.g. 「邊樣係蝦餃？」 */
  promptLine: string;
  answer: string;
  options: ChoiceOption[];
};

export type ChoiceConfig = {
  themeId: string;
  guide: FestivalGuideId;
  title: { yue: string; pu: string };
  rounds: ChoiceRound[];
  doneLine: string;
};

type Props = {
  config: ChoiceConfig;
  onComplete: () => void;
};

/**
 * 聽問題、揀圖片 — no reading needed, no penalty for wrong answers.
 * Every tap says the item's name, so the child learns while exploring.
 */
export function ChoiceGame({ config, onComplete }: Props) {
  const { state } = useProgress();
  const lang = state.profile?.lang ?? 'yue';
  const [round, setRound] = useState(0);
  const [found, setFound] = useState<string | null>(null);
  const [shakeId, setShakeId] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);
  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));

  const current = config.rounds[round];

  useEffect(() => {
    if (!finished && current) void playLine(current.promptLine);
  }, [round, finished, current]);

  useIdleHint({
    enabled: !finished && !found,
    onIdle: () => current && void playLine(current.promptLine),
  });

  const pick = (opt: ChoiceOption) => {
    if (found || finished || !current) return;
    if (opt.id === current.answer) {
      playSfx('success');
      setFound(opt.id);
      void speakText(`${opt.label[lang]}！啱晒！`, lang);
      later(() => {
        setFound(null);
        if (round + 1 >= config.rounds.length) {
          setFinished(true);
          playSfx('cheer');
          void playLine(config.doneLine);
        } else {
          setRound((r) => r + 1);
        }
      }, 1800);
    } else {
      playSfx('tap');
      setShakeId(opt.id);
      void speakText(`呢個係${opt.label[lang]}。再搵吓！`, lang);
      later(() => setShakeId(null), 500);
    }
  };

  return (
    <div className={styles.page}>
      <TopBar backTo="theme" themeId={config.themeId} />
      <Subtitle />
      <Confetti active={finished} />

      <div className={styles.header}>
        <Guide id={config.guide} pose={finished || found ? 'cheer' : 'talk'} size={96} />
        <div>
          <h1 className={styles.title}>{config.title[lang]}</h1>
          <div className={styles.dots} aria-label={`第 ${round + 1} 題`}>
            {config.rounds.map((_, i) => (
              <span
                key={i}
                className={[
                  styles.dot,
                  i < round || finished ? styles.dotDone : '',
                  i === round && !finished ? styles.dotNow : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              />
            ))}
          </div>
        </div>
      </div>

      {!finished && current && (
        <div className={styles.options} key={round}>
          {current.options.map((opt) => (
            <motion.button
              key={opt.id}
              type="button"
              className={[styles.option, found === opt.id ? styles.correct : '']
                .filter(Boolean)
                .join(' ')}
              onClick={() => pick(opt)}
              aria-label={opt.label[lang]}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={
                shakeId === opt.id
                  ? { x: [0, -10, 10, -6, 6, 0], scale: 1, opacity: 1 }
                  : found === opt.id
                    ? { scale: [1, 1.15, 1.08], opacity: 1 }
                    : { scale: found ? 0.9 : 1, opacity: found ? 0.4 : 1 }
              }
              transition={{ duration: 0.45 }}
            >
              <ArtOrLabel src={opt.img} label={opt.label[lang]} className={styles.optionImg} />
            </motion.button>
          ))}
        </div>
      )}

      <div className={styles.actions}>
        {finished ? (
          <BigButton onClick={onComplete}>完成 ✔</BigButton>
        ) : (
          <BigButton
            variant="secondary"
            onClick={() => current && void playLine(current.promptLine)}
            aria-label="再聽一次"
          >
            再聽一次
          </BigButton>
        )}
      </div>
    </div>
  );
}
