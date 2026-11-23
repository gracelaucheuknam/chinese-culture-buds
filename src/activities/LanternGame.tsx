import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { BigButton } from '../components/BigButton';
import { Guide } from '../components/Guide';
import { Subtitle } from '../components/Subtitle';
import { TopBar } from '../components/TopBar';
import { assets } from '../content/assets';
import { playLine, playSfx } from '../engine/audio';
import { useIdleHint } from '../engine/useIdleHint';
import styles from './LanternGame.module.css';

const LANTERN_SHAPE = {
  round: assets.midautumn.lantern.shapeRound,
  rabbit: assets.midautumn.lantern.shapeRabbit,
  star: assets.midautumn.lantern.shapeStar,
} as const;

const LANTERN_STICKER = {
  rabbit: assets.midautumn.lantern.stickerRabbit,
  mooncake: assets.midautumn.lantern.stickerMooncake,
  pomelo: assets.midautumn.lantern.stickerPomelo,
  star: assets.midautumn.lantern.stickerStar,
  moon: assets.midautumn.lantern.stickerMoon,
  osmanthus: assets.midautumn.lantern.stickerOsmanthus,
} as const;

type ShapeId = 'round' | 'rabbit' | 'star';
type StickerId = 'rabbit' | 'mooncake' | 'pomelo' | 'star' | 'moon' | 'osmanthus';
type Step = 'shape' | 'decorate' | 'lit' | 'done';

const SHAPES: Array<{ id: ShapeId; label: string }> = [
  { id: 'round', label: '圓形' },
  { id: 'rabbit', label: '白兔' },
  { id: 'star', label: '星星' },
];

const STICKERS: StickerId[] = ['rabbit', 'mooncake', 'pomelo', 'star', 'moon', 'osmanthus'];
const SLOT_COUNT = 6;
const MIN_STICKERS = 3;

type Props = {
  onComplete: () => void;
};

export function LanternGame({ onComplete }: Props) {
  const [step, setStep] = useState<Step>('shape');
  const [shape, setShape] = useState<ShapeId | null>(null);
  const [placed, setPlaced] = useState<Array<StickerId | null>>(Array(SLOT_COUNT).fill(null));
  const [lightHintPlayed, setLightHintPlayed] = useState(false);

  const placedCount = placed.filter(Boolean).length;
  const isLit = step === 'lit' || step === 'done';

  useEffect(() => {
    if (step === 'shape') void playLine('ma_lantern_shape');
    if (step === 'decorate') void playLine('ma_lantern_intro');
  }, [step]);

  useEffect(() => {
    if (step === 'decorate' && placedCount >= MIN_STICKERS && !lightHintPlayed) {
      setLightHintPlayed(true);
      void playLine('ma_lantern_light');
    }
  }, [placedCount, step, lightHintPlayed]);

  useIdleHint({
    enabled: step === 'shape' || step === 'decorate',
    onIdle: () => {
      void playLine(step === 'shape' ? 'ma_lantern_shape' : 'ma_idle');
    },
  });

  const placeSticker = (id: StickerId) => {
    const nextIndex = placed.findIndex((s) => s === null);
    if (nextIndex < 0) return;
    playSfx('snap');
    setPlaced((prev) => {
      const next = [...prev];
      next[nextIndex] = id;
      return next;
    });
  };

  const lightUp = () => {
    playSfx('cheer');
    void playLine('ma_lantern_done');
    setStep('lit');
  };

  return (
    <div className={[styles.page, isLit ? styles.night : styles.day].join(' ')}>
      <TopBar backTo="theme" themeId="midautumn" />
      <Subtitle />
      <Guide id="puff" pose={isLit ? 'cheer' : 'idle'} size={88} />

      {step === 'shape' && (
        <>
          <h1 className={styles.title}>揀一個燈籠</h1>
          <div className={styles.shapes}>
            {SHAPES.map((s) => (
              <button
                key={s.id}
                type="button"
                className={styles.shapeCard}
                onClick={() => {
                  playSfx('tap');
                  setShape(s.id);
                  setStep('decorate');
                }}
              >
                <img
                  src={LANTERN_SHAPE[s.id]}
                  alt=""
                  width={100}
                  height={110}
                  decoding="async"
                  draggable={false}
                />
                {s.label}
              </button>
            ))}
          </div>
        </>
      )}

      {(step === 'decorate' || isLit) && shape && (
        <>
          <h1 className={styles.title}>{step === 'decorate' ? '裝飾你嘅燈籠' : '好靚呀！'}</h1>
          <div className={`${styles.stage} ${isLit ? styles.lit : ''}`}>
            <div className={styles.moon} aria-hidden>
              <img
                src={assets.midautumn.props.starOn}
                alt=""
                width={56}
                height={56}
                decoding="async"
                draggable={false}
              />
            </div>
            <motion.div className={styles.lanternWrap} layoutId="lantern">
              <img
                className={styles.lantern}
                src={LANTERN_SHAPE[shape]}
                alt=""
                decoding="async"
                draggable={false}
              />
              <div className={styles.slots}>
                {placed.map((sticker, i) => (
                  <div key={i} className={styles.slot}>
                    {sticker && (
                      <motion.img
                        src={LANTERN_STICKER[sticker]}
                        alt=""
                        decoding="async"
                        draggable={false}
                        initial={{ scale: 0.4, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 320, damping: 16 }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </>
      )}

      {step === 'decorate' && (
        <>
          <div className={styles.palette} role="listbox" aria-label="貼紙">
            {STICKERS.map((id) => (
              <button
                key={id}
                type="button"
                className={styles.stickerBtn}
                disabled={placedCount >= SLOT_COUNT}
                onClick={() => placeSticker(id)}
                aria-label={id}
              >
                <img
                  src={LANTERN_STICKER[id]}
                  alt=""
                  width={70}
                  height={70}
                  decoding="async"
                  draggable={false}
                />
              </button>
            ))}
          </div>
          <div className={styles.actions}>
            {placedCount >= MIN_STICKERS && (
              <button type="button" className={styles.bulb} onClick={lightUp} aria-label="點亮燈籠">
                <img
                  src={assets.ui.iconStar}
                  alt=""
                  width={48}
                  height={48}
                  decoding="async"
                  draggable={false}
                />
              </button>
            )}
          </div>
        </>
      )}

      {isLit && (
        <div className={styles.actions}>
          <BigButton
            onClick={() => {
              setStep('done');
              onComplete();
            }}
          >
            完成 ✔
          </BigButton>
        </div>
      )}
    </div>
  );
}
