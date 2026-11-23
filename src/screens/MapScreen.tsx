import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { assets } from '../content/assets';
import { mapHubStand, mapIslands, type MapPoint } from '../content/map';
import { getTheme, themes } from '../content/themes';
import { Avatar } from '../components/Avatar';
import { BigButton } from '../components/BigButton';
import { Subtitle } from '../components/Subtitle';
import { TopBar } from '../components/TopBar';
import { playLine, playSfx } from '../engine/audio';
import { useProgress } from '../engine/progress';
import { navigate } from '../engine/routing';
import styles from './MapScreen.module.css';

const WALK_MS = 900;

const SPARKLES = [
  { left: '22%', top: '72%', delay: 0 },
  { left: '38%', top: '78%', delay: 0.4 },
  { left: '55%', top: '74%', delay: 0.8 },
  { left: '70%', top: '80%', delay: 0.2 },
  { left: '85%', top: '70%', delay: 1.1 },
  { left: '12%', top: '62%', delay: 0.6 },
];

const CLOUDS = [
  { left: '8%', top: '12%', w: 140, dur: 28 },
  { left: '55%', top: '6%', w: 110, dur: 34 },
  { left: '78%', top: '18%', w: 160, dur: 40 },
];

export function MapScreen() {
  const { state } = useProgress();
  const profile = state.profile;
  const lang = profile?.lang ?? 'yue';
  const [playerPos, setPlayerPos] = useState<MapPoint>(mapHubStand);
  const [moving, setMoving] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const name = profile?.name ?? '小朋友';

  const islands = useMemo(
    () =>
      mapIslands.map((island) => {
        const theme = getTheme(island.themeId) ?? themes.find((t) => t.id === island.themeId);
        const locked = theme?.status === 'coming_soon';
        const done = Boolean(state.stickers[island.themeId]);
        return { island, theme, locked: Boolean(locked), done };
      }),
    [state.stickers],
  );

  const goIsland = (themeId: string, locked: boolean, stand: MapPoint) => {
    if (moving) return;
    playSfx('tap');
    setActiveId(themeId);
    setMoving(true);
    setPlayerPos(stand);

    window.setTimeout(() => {
      setMoving(false);
      setActiveId(null);
      if (locked) {
        void playLine('common_coming_soon');
        return;
      }
      navigate({ name: 'theme', themeId });
    }, WALK_MS);
  };

  return (
    <div className={styles.page}>
      <TopBar backTo="start" />
      <Subtitle />

      <div className={styles.stage}>
        <img
          className={styles.bg}
          src={assets.map.bg}
          alt=""
          width={1600}
          height={1000}
          decoding="async"
          draggable={false}
        />

        <div className={styles.ambient} aria-hidden>
          {CLOUDS.map((c, i) => (
            <motion.span
              key={i}
              className={styles.cloud}
              style={{ left: c.left, top: c.top, width: c.w, height: c.w * 0.45 }}
              animate={{ x: [0, 36, 0] }}
              transition={{ duration: c.dur, repeat: Infinity, ease: 'easeInOut' }}
            />
          ))}
          {SPARKLES.map((s, i) => (
            <motion.span
              key={`sp-${i}`}
              className={styles.sparkle}
              style={{ left: s.left, top: s.top }}
              animate={{ opacity: [0.15, 0.9, 0.15], scale: [0.7, 1.2, 0.7] }}
              transition={{ duration: 2.4, repeat: Infinity, delay: s.delay, ease: 'easeInOut' }}
            />
          ))}
        </div>

        {/* Whole-island hit targets */}
        {islands.map(({ island, theme, locked, done }) => {
          const title = theme?.title[lang] ?? island.label[lang];
          const glowing = activeId === island.themeId && !locked;
          return (
            <button
              key={island.themeId}
              type="button"
              className={[
                styles.island,
                locked ? styles.islandLocked : '',
                glowing ? styles.islandGlow : '',
              ]
                .filter(Boolean)
                .join(' ')}
              style={{
                left: `${island.hit.cx}%`,
                top: `${island.hit.cy}%`,
                width: `${island.hit.rx * 2}%`,
                height: `${island.hit.ry * 2}%`,
              }}
              aria-label={title + (locked ? '（即將推出）' : '')}
              disabled={moving}
              onClick={() => goIsland(island.themeId, locked, island.stand)}
            >
              {locked && <span className={styles.cloudCover} aria-hidden />}
              {locked && (
                <span className={styles.lockBadge}>
                  <img
                    src={assets.ui.iconHome}
                    alt=""
                    width={36}
                    height={36}
                    decoding="async"
                    draggable={false}
                  />
                </span>
              )}
              {done && !locked && (
                <img
                  className={styles.doneBadge}
                  src={assets.ui.medal}
                  alt=""
                  width={40}
                  height={40}
                  decoding="async"
                  draggable={false}
                />
              )}
            </button>
          );
        })}

        {/* Labels above avatar so names are never covered */}
        {islands.map(({ island, theme, locked }) => {
          const title = theme?.title[lang] ?? island.label[lang];
          return (
            <div
              key={`label-${island.themeId}`}
              className={[styles.islandLabel, locked ? styles.labelLocked : '']
                .filter(Boolean)
                .join(' ')}
              style={{ left: `${island.labelPos.x}%`, top: `${island.labelPos.y}%` }}
            >
              {title}
            </div>
          );
        })}

        {profile && (
          <motion.div
            className={styles.player}
            initial={false}
            animate={{ left: `${playerPos.x}%`, top: `${playerPos.y}%` }}
            transition={{ duration: WALK_MS / 1000, ease: 'easeInOut' }}
          >
            <Avatar
              head={profile.head}
              size={150}
              pose={moving ? 'walk' : undefined}
              interactive={false}
            />
          </motion.div>
        )}
      </div>

      <div className={styles.stickersBtn}>
        <BigButton variant="secondary" onClick={() => navigate({ name: 'stickers' })}>
          貼紙簿
        </BigButton>
      </div>

      {!profile && (
        <div className={styles.needAvatar}>
          <BigButton onClick={() => navigate({ name: 'avatar' })}>
            先建立角色（{name}）
          </BigButton>
        </div>
      )}
    </div>
  );
}
