import { motion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { assets, guidePoseSrc, type GuideCharacterId } from '../content/assets';
import type { StoryConfig, StoryHotspot } from '../content/stories';
import { ArtOrLabel } from '../components/ArtOrLabel';
import { Avatar } from '../components/Avatar';
import { BigButton } from '../components/BigButton';
import { Subtitle } from '../components/Subtitle';
import { TopBar } from '../components/TopBar';
import {
  pauseVoice,
  playLine,
  playSfx,
  resumeVoice,
  speakText,
  stopNarration,
} from '../engine/audio';
import { useProgress } from '../engine/progress';
import { navigate } from '../engine/routing';
import { useIdleHint } from '../engine/useIdleHint';
import styles from './StoryPlayer.module.css';

function isGuideId(id: string): id is GuideCharacterId {
  return ['puff', 'dongdong', 'caicai', 'baobao', 'houyi', 'change', 'quyuan'].includes(id);
}

const AUTO_CONTINUE_MS = 10000;
const SUN_YAWN_MS = 280;
const SUN_SLEEP_MS = 420;
const SUN_FLY_MS = 520;

type Props = {
  story: StoryConfig;
  onComplete: () => void;
};

type HotspotPhase = 'hot' | 'yawn' | 'sleep' | 'fly' | 'gone';

type HotspotState = Record<
  string,
  {
    done: boolean;
    glow?: boolean;
    bounce?: number;
    taps?: number;
    phase?: HotspotPhase;
  }
>;

export function StoryPlayer({ story, onComplete }: Props) {
  const { state } = useProgress();
  const lang = state.profile?.lang ?? 'yue';
  const name = state.profile?.name ?? '小朋友';

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [narrationDone, setNarrationDone] = useState(false);
  const [interactions, setInteractions] = useState(0);
  const [hotspots, setHotspots] = useState<HotspotState>({});
  const [wiggleId, setWiggleId] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [sceneKey, setSceneKey] = useState(0);

  const pausedRef = useRef(paused);
  const indexRef = useRef(index);
  const advancingRef = useRef(false);
  const busyRef = useRef<Set<string>>(new Set());
  /** Timers started inside a scene; cleared when the scene changes or the player closes. */
  const timersRef = useRef<Set<number>>(new Set());
  const later = useCallback((fn: () => void, ms: number) => {
    const t = window.setTimeout(() => {
      timersRef.current.delete(t);
      fn();
    }, ms);
    timersRef.current.add(t);
  }, []);
  const clearSceneTimers = useCallback(() => {
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current.clear();
  }, []);
  useEffect(() => clearSceneTimers, [clearSceneTimers]);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  const scene = story.scenes[index];
  const required = scene?.requiredInteractions ?? 0;
  const idleLine = story.idleLine ?? 'common_idle';

  const remainingHotspots = useMemo(() => {
    return (scene?.hotspots ?? []).filter((h) => {
      if (h.kind === 'sun_wiggle' || h.kind === 'label_bounce' || h.kind === 'character_wave') {
        return true;
      }
      if (h.kind === 'tap_progress') return interactions < required;
      return !hotspots[h.id]?.done;
    });
  }, [scene, hotspots, interactions, required]);

  const goNext = useCallback(() => {
    if (advancingRef.current) return;
    advancingRef.current = true;
    stopNarration();
    clearSceneTimers();
    busyRef.current.clear();
    setWiggleId(null);

    const next = indexRef.current + 1;
    if (next >= story.scenes.length) {
      onComplete();
      advancingRef.current = false;
      return;
    }
    setIndex(next);
    setNarrationDone(false);
    setInteractions(0);
    setHotspots({});
    setShowHint(false);
    setPaused(false);
    setSceneKey((k) => k + 1);
    advancingRef.current = false;
  }, [onComplete, story.scenes.length, clearSceneTimers]);

  useEffect(() => {
    if (!scene) return;
    let cancelled = false;
    setNarrationDone(false);
    setShowHint(false);

    void (async () => {
      await playLine(scene.lineId, { name });
      if (cancelled) return;
      setNarrationDone(true);
    })();

    return () => {
      cancelled = true;
      stopNarration();
    };
  }, [scene, name, sceneKey]);

  useEffect(() => {
    if (!scene || !narrationDone || paused) return;

    if (required > 0 && interactions >= required) {
      const t = window.setTimeout(() => goNext(), 700);
      return () => window.clearTimeout(t);
    }

    if (required > 0 && interactions < required) {
      const t = window.setTimeout(() => {
        if (!pausedRef.current) goNext();
      }, AUTO_CONTINUE_MS);
      return () => window.clearTimeout(t);
    }

    if (scene.autoAdvance || required === 0) {
      const t = window.setTimeout(() => {
        if (!pausedRef.current) goNext();
      }, 2200);
      return () => window.clearTimeout(t);
    }
  }, [scene, narrationDone, paused, required, interactions, goNext]);

  useIdleHint({
    enabled: !paused && narrationDone && required > 0 && interactions < required,
    onIdle: () => {
      setShowHint(true);
      void playLine(idleLine);
    },
  });

  const markInteractionDone = (id: string) => {
    setHotspots((prev) => ({
      ...prev,
      [id]: { ...prev[id], done: true, phase: 'gone' },
    }));
    setInteractions((n) => n + 1);
    busyRef.current.delete(id);
  };

  const runSunDismiss = (id: string) => {
    if (busyRef.current.has(id)) return;
    busyRef.current.add(id);
    playSfx('snap');

    setHotspots((prev) => ({ ...prev, [id]: { done: false, phase: 'yawn' } }));
    later(() => {
      setHotspots((prev) => ({
        ...prev,
        [id]: { ...prev[id], done: false, phase: 'sleep' },
      }));
    }, SUN_YAWN_MS);
    later(() => {
      setHotspots((prev) => ({
        ...prev,
        [id]: { ...prev[id], done: false, phase: 'fly' },
      }));
    }, SUN_YAWN_MS + SUN_SLEEP_MS);
    later(
      () => {
        markInteractionDone(id);
      },
      SUN_YAWN_MS + SUN_SLEEP_MS + SUN_FLY_MS,
    );
  };

  const runTossDismiss = (id: string) => {
    if (busyRef.current.has(id) || hotspots[id]?.done) return;
    busyRef.current.add(id);
    playSfx('snap');
    setHotspots((prev) => ({ ...prev, [id]: { done: false, phase: 'fly' } }));
    later(() => markInteractionDone(id), SUN_FLY_MS);
  };

  const onHotspot = (spot: StoryHotspot) => {
    if (paused) return;
    const st = hotspots[spot.id];
    if (
      (spot.kind === 'sun_dismiss' || spot.kind === 'star_glow' || spot.kind === 'zongzi_toss') &&
      st?.done
    ) {
      return;
    }
    if (busyRef.current.has(spot.id)) return;

    playSfx(spot.kind === 'tap_progress' ? 'drum' : 'tap');

    if (spot.kind === 'sun_wiggle' || spot.kind === 'character_wave') {
      setWiggleId(spot.id);
      later(() => setWiggleId(null), 600);
      return;
    }

    if (spot.kind === 'sun_dismiss') {
      runSunDismiss(spot.id);
      return;
    }

    if (spot.kind === 'zongzi_toss') {
      runTossDismiss(spot.id);
      return;
    }

    if (spot.kind === 'star_glow') {
      setHotspots((prev) => ({ ...prev, [spot.id]: { done: true, glow: true } }));
      setInteractions((n) => n + 1);
      playSfx('success');
      return;
    }

    if (spot.kind === 'tap_progress') {
      setWiggleId(spot.id);
      later(() => setWiggleId(null), 250);
      setInteractions((n) => n + 1);
      playSfx('drum');
      return;
    }

    if (spot.kind === 'label_bounce') {
      const label = spot.label?.[lang] ?? '';
      setHotspots((prev) => ({
        ...prev,
        [spot.id]: { done: false, bounce: Date.now() },
      }));
      if (label) void speakText(label, lang);
    }
  };

  const togglePause = () => {
    setPaused((p) => {
      const next = !p;
      if (next) pauseVoice();
      else resumeVoice();
      playSfx('tap');
      return next;
    });
  };

  if (!scene) return null;

  const hintSpot = remainingHotspots.find(
    (h) =>
      h.kind === 'sun_dismiss' ||
      h.kind === 'star_glow' ||
      h.kind === 'tap_progress' ||
      h.kind === 'zongzi_toss',
  );

  const playerOutfit = scene.playerOutfit ?? 'daily';
  const overlayOpacity = scene.overlayBg && required > 0 ? Math.min(1, interactions / required) : 0;

  return (
    <div className={styles.page}>
      <TopBar backTo="theme" themeId={story.themeId} />
      <Subtitle offsetBottom={110} />

      <div className={styles.stage}>
        <motion.div
          key={`kenburns-${sceneKey}`}
          className={styles.bgWrap}
          initial={{ scale: 1 }}
          animate={{ scale: 1.03 }}
          transition={{ duration: 20, ease: 'linear' }}
        >
          <img
            className={styles.bg}
            src={scene.bg}
            alt=""
            width={1280}
            height={800}
            decoding="async"
            draggable={false}
            onError={(e) => {
              e.currentTarget.style.visibility = 'hidden';
            }}
          />
          {scene.overlayBg && (
            <img
              className={styles.bgOverlay}
              src={scene.overlayBg}
              alt=""
              width={1280}
              height={800}
              decoding="async"
              draggable={false}
              style={{ opacity: overlayOpacity }}
            />
          )}
          {scene.fg && (
            <img
              className={styles.fg}
              src={scene.fg}
              alt=""
              width={1280}
              height={800}
              decoding="async"
              draggable={false}
            />
          )}
        </motion.div>

        {(scene.ambient ?? []).map((item) => {
          const rtl = item.direction === 'rtl';
          return (
            <motion.img
              key={`${sceneKey}-${item.id}`}
              className={styles.ambient}
              src={item.src}
              alt=""
              decoding="async"
              draggable={false}
              style={{
                top: `${item.y}%`,
                left: 0,
                width: item.size ?? 80,
                height: 'auto',
              }}
              initial={{
                x: rtl ? '110vw' : '-20vw',
                scaleX: rtl ? -1 : 1,
              }}
              animate={{
                x: rtl ? '-20vw' : '110vw',
              }}
              transition={{
                duration: item.duration ?? 10,
                delay: item.delay ?? 0,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          );
        })}

        {(scene.characters ?? []).map((ch) => {
          const src =
            ch.src ??
            (isGuideId(ch.id) ? guidePoseSrc(ch.id, ch.pose ?? 'idle') : assets.ui.iconStar);
          return (
            <motion.img
              key={ch.id}
              className={styles.character}
              src={src}
              alt=""
              decoding="async"
              draggable={false}
              onError={(e) => {
                e.currentTarget.style.visibility = 'hidden';
              }}
              style={{
                right: ch.right,
                left: ch.left,
                bottom: ch.bottom ?? '10%',
                width: ch.width ?? 'min(28vw, 220px)',
                zIndex: ch.zIndex ?? 3,
              }}
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            />
          );
        })}

        {scene.showPlayer && state.profile && (
          <div className={styles.player}>
            <Avatar
              head={state.profile.head}
              gender={state.profile.gender}
              outfit={playerOutfit}
              size={150}
            />
          </div>
        )}

        {(scene.hotspots ?? []).map((spot) => {
          const st = hotspots[spot.id];
          const phase = st?.phase ?? 'hot';
          const gone = st?.done || phase === 'gone';

          let imgSrc = spot.asset ?? assets.ui.iconStar;
          if (spot.kind === 'sun_dismiss') {
            if (phase === 'yawn') imgSrc = assets.midautumn.props.sunYawn;
            else if (phase === 'sleep' || phase === 'fly') {
              imgSrc = assets.midautumn.props.sunSleep;
            }
          } else if (spot.kind === 'star_glow' && st?.glow) {
            imgSrc = assets.midautumn.props.starOn;
          } else if (spot.kind === 'tap_progress' && wiggleId === spot.id) {
            imgSrc = assets.dragonboat.props.drumLit;
          }

          const canDrag = spot.kind === 'zongzi_toss' && !gone && phase !== 'fly';

          return (
            <motion.button
              key={spot.id}
              type="button"
              className={[
                styles.hotspot,
                gone ? styles.hotspotGone : '',
                st?.glow ? styles.glow : '',
              ]
                .filter(Boolean)
                .join(' ')}
              style={{
                left: `${spot.x}%`,
                top: `${spot.y}%`,
                width: spot.size ?? 88,
                height: spot.size ?? 88,
              }}
              aria-label={spot.label?.[lang] ?? spot.id}
              onClick={() => onHotspot(spot)}
              drag={canDrag}
              dragMomentum={false}
              dragElastic={0.15}
              onDragEnd={(_, info) => {
                if (!canDrag) return;
                if (Math.hypot(info.offset.x, info.offset.y) > 48) {
                  runTossDismiss(spot.id);
                }
              }}
              animate={
                phase === 'fly'
                  ? {
                      y: -220,
                      opacity: 0,
                      scale: 0.55,
                      rotate: spot.kind === 'zongzi_toss' ? 40 : -25,
                    }
                  : wiggleId === spot.id
                    ? { rotate: [-8, 8, -6, 6, 0], scale: [1, 1.12, 1] }
                    : st?.bounce
                      ? { scale: [1, 1.25, 1] }
                      : {
                          scale: phase === 'yawn' ? 1.08 : phase === 'sleep' ? 0.92 : 1,
                          opacity: 1,
                          y: 0,
                        }
              }
              transition={{ duration: phase === 'fly' ? 0.5 : 0.45 }}
            >
              <ArtOrLabel src={imgSrc} label={spot.label?.[lang] ?? ''} />
            </motion.button>
          );
        })}

        {showHint && hintSpot && (
          <div
            className={styles.hintFinger}
            style={{ left: `${hintSpot.x}%`, top: `${hintSpot.y}%` }}
          >
            <img
              src={assets.ui.iconStar}
              alt=""
              width={42}
              height={42}
              decoding="async"
              draggable={false}
            />
          </div>
        )}
      </div>

      <div className={styles.controls}>
        <BigButton variant="secondary" onClick={togglePause} aria-label={paused ? '播放' : '暫停'}>
          <img
            src={paused ? assets.ui.iconPlay : assets.ui.iconPause}
            alt=""
            width={36}
            height={36}
            decoding="async"
            draggable={false}
          />
        </BigButton>
        <BigButton
          variant="secondary"
          onClick={() => {
            playSfx('tap');
            goNext();
          }}
        >
          下一頁
        </BigButton>
        <BigButton
          variant="ghost"
          onClick={() => {
            stopNarration();
            navigate({ name: 'theme', themeId: story.themeId });
          }}
        >
          離開
        </BigButton>
      </div>
    </div>
  );
}
