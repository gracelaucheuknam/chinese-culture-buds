import { useCallback, useEffect, useRef, useState } from 'react';
import { Avatar } from '../components/Avatar';
import { BigButton } from '../components/BigButton';
import { Confetti } from '../components/Confetti';
import { Subtitle } from '../components/Subtitle';
import { TopBar } from '../components/TopBar';
import { assets } from '../content/assets';
import { playLine, playSfx } from '../engine/audio';
import { useProgress } from '../engine/progress';
import { useIdleHint } from '../engine/useIdleHint';
import styles from './RaceGame.module.css';

const BPM = 85;
const BEAT_MS = Math.round(60000 / BPM);
const BEAT_WINDOW_MS = 180;
const FINISH_AT = 100;
const AUTO_SPEED = 0.035;
const HIT_SPEED = 2.4;
const MISS_SPEED = 0.9;

type Props = {
  onComplete: () => void;
};

type Splash = { id: number; x: number; y: number };

export function RaceGame({ onComplete }: Props) {
  const { state } = useProgress();
  const [progress, setProgress] = useState(4);
  const [onBeat, setOnBeat] = useState(false);
  const [splashes, setSplashes] = useState<Splash[]>([]);
  const [rowing, setRowing] = useState(false);
  const [finished, setFinished] = useState(false);

  const progressRef = useRef(progress);
  const finishedRef = useRef(false);
  const lastBeatRef = useRef(0);
  const cheerAtRef = useRef(10);
  const splashIdRef = useRef(0);
  const onBeatRef = useRef(false);
  const shownProgressRef = useRef(4);
  const timersRef = useRef<number[]>([]);
  useEffect(() => () => timersRef.current.forEach((t) => window.clearTimeout(t)), []);

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    void playLine('db_race_intro');
  }, []);

  useEffect(() => {
    let raf = 0;
    let last = 0;
    lastBeatRef.current = performance.now();

    const tick = (now: number) => {
      if (!last) last = now;
      const dt = Math.min(48, now - last);
      last = now;

      const sinceBeat = (now - lastBeatRef.current) % BEAT_MS;
      const nearBeat = sinceBeat < BEAT_WINDOW_MS || sinceBeat > BEAT_MS - BEAT_WINDOW_MS;
      // only re-render when the beat state actually flips (was 60 renders / second)
      if (nearBeat !== onBeatRef.current) {
        onBeatRef.current = nearBeat;
        setOnBeat(nearBeat);
      }

      if (!finishedRef.current) {
        const next = Math.min(FINISH_AT, progressRef.current + AUTO_SPEED * (dt / 16));
        if (next !== progressRef.current) {
          progressRef.current = next;
          if (next - shownProgressRef.current >= 0.25 || next >= FINISH_AT) {
            shownProgressRef.current = next;
            setProgress(next);
          }
        }

        if (next >= cheerAtRef.current && next < FINISH_AT) {
          cheerAtRef.current += 33;
          void playLine('db_race_cheer');
        }

        if (next >= FINISH_AT) {
          finishedRef.current = true;
          setFinished(true);
          playSfx('cheer');
          void playLine('db_race_done');
        }
      }

      if (sinceBeat < dt) {
        lastBeatRef.current = now - sinceBeat;
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const spawnSplash = () => {
    const a = ++splashIdRef.current;
    const b = ++splashIdRef.current;
    const c = ++splashIdRef.current;
    const burst: Splash[] = [
      { id: a, x: 18 + Math.random() * 12, y: 70 + Math.random() * 10 },
      { id: b, x: 55 + Math.random() * 16, y: 72 + Math.random() * 12 },
      { id: c, x: 35 + Math.random() * 14, y: 78 + Math.random() * 8 },
    ];
    setSplashes((prev) => [...prev.slice(-6), ...burst]);
    timersRef.current.push(
      window.setTimeout(() => {
        setSplashes((prev) => prev.filter((s) => s.id !== a && s.id !== b && s.id !== c));
      }, 420),
    );
  };

  const hitDrum = useCallback(() => {
    if (finishedRef.current) return;
    const now = performance.now();
    const sinceBeat = (now - lastBeatRef.current) % BEAT_MS;
    const nearBeat = sinceBeat < BEAT_WINDOW_MS || sinceBeat > BEAT_MS - BEAT_WINDOW_MS;

    playSfx('drum');
    spawnSplash();
    setRowing(true);
    timersRef.current.push(window.setTimeout(() => setRowing(false), 280));

    const step = nearBeat ? HIT_SPEED : MISS_SPEED;
    const next = Math.min(FINISH_AT, progressRef.current + step);
    progressRef.current = next;
    shownProgressRef.current = next;
    setProgress(next);
  }, []);

  useIdleHint({
    enabled: !finished,
    onIdle: () => void playLine('db_idle'),
  });

  const boatLeft = `${10 + progress * 0.72}%`;
  const bgShift = (progress / FINISH_AT) * 50;

  return (
    <div className={styles.page}>
      <TopBar backTo="theme" themeId="dragonboat" />
      {/* sit above the drum bar so the drum is never covered */}
      <Subtitle offsetBottom={typeof window !== 'undefined' && window.innerHeight <= 820 ? 168 : 198} />
      <Confetti active={finished} />
      <div className={styles.progress}>划呀划！{Math.round(progress)}%</div>

      <div className={styles.river}>
        <div className={styles.bgTrack} style={{ transform: `translate3d(-${bgShift}%, 0)` }}>
          <img
            className={styles.bg}
            src={assets.dragonboat.race.riverBg}
            alt=""
            decoding="async"
            draggable={false}
          />
          <img
            className={styles.bg}
            src={assets.dragonboat.race.riverBg}
            alt=""
            decoding="async"
            draggable={false}
          />
        </div>

        <div
          className={[styles.boatWrap, rowing ? styles.boatHit : ''].join(' ')}
          style={{ left: boatLeft }}
        >
          <div className={styles.seats}>
            {state.profile && (
              <div className={styles.seatPlayer}>
                <Avatar
                  head={state.profile.head}
                  gender={state.profile.gender}
                  outfit="dragonboat"
                  size={48}
                />
              </div>
            )}
            <div className={styles.seatDong}>
              <img
                src={assets.characters.dongdong.stand}
                alt=""
                width={52}
                height={70}
                decoding="async"
                draggable={false}
              />
            </div>
          </div>
          <img
            className={styles.boat}
            src={assets.dragonboat.race.boatCrew}
            alt=""
            decoding="async"
            draggable={false}
          />
          {splashes.map((s) => (
            <span
              key={String(s.id)}
              className={styles.splash}
              style={{ left: `${s.x}%`, top: `${s.y}%` }}
              aria-hidden
            />
          ))}
        </div>
      </div>

      <div className={styles.controls}>
        <button
          type="button"
          className={[styles.drum, onBeat ? styles.drumBeat : ''].join(' ')}
          aria-label="打鼓"
          onClick={hitDrum}
        >
          <img
            src={onBeat ? assets.dragonboat.props.drumLit : assets.dragonboat.props.drum}
            alt=""
            width={180}
            height={180}
            decoding="async"
            draggable={false}
          />
        </button>
      </div>

      {finished && (
        <div className={styles.finish} role="dialog" aria-label="到終點">
          <h2>到終點喇！</h2>
          <BigButton onClick={onComplete}>完成 ✔</BigButton>
        </div>
      )}
    </div>
  );
}
