import { AnimatePresence, motion, type TargetAndTransition } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { accessConfig, isActivityLocked } from '../config/access';
import { appConfig } from '../config/app';
import { activityIconSrc, assets, guideInfo, guidePoseSrc, type FestivalGuideId } from '../content/assets';
import { getTheme } from '../content/themes';
import type { GuidePose } from '../components/Guide';
import { Avatar } from '../components/Avatar';
import { BigButton } from '../components/BigButton';
import { Guide } from '../components/Guide';
import { ParentGate } from '../components/ParentGate';
import { StickerReward } from '../components/StickerReward';
import { Subtitle } from '../components/Subtitle';
import { TopBar } from '../components/TopBar';
import { playLine, playSfx, stopNarration } from '../engine/audio';
import { useProgress } from '../engine/progress';
import { navigate } from '../engine/routing';
import { useIdleHint } from '../engine/useIdleHint';
import { SceneBackground } from '../components/SceneBackground';
import styles from './ThemeHome.module.css';

type Props = { themeId: string };

export function ThemeHome({ themeId }: Props) {
  const theme = getTheme(themeId);
  const { state, dispatch } = useProgress();
  const lang = state.profile?.lang ?? 'yue';
  const name = state.profile?.name ?? '小朋友';
  const [rewardOpen, setRewardOpen] = useState(false);
  const [lockFlow, setLockFlow] = useState<'none' | 'gate' | 'survey' | 'paid'>('none');
  const [guidePose, setGuidePose] = useState<GuidePose>('welcome');
  const [phase, setPhase] = useState<'intro' | 'menu'>('intro');
  const skipIntro = () => {
    stopNarration();
    setGuidePose('idle');
    setPhase('menu');
  };

  const completedAll = useMemo(() => {
    if (!theme || theme.activities.length === 0) return false;
    return theme.activities.every((a) => state.completed[a.id]);
  }, [theme, state.completed]);

  useEffect(() => {
    if (!theme) return;
    let cancelled = false;
    let idleTimer = 0;
    // Defer so Subtitle can subscribe after route clear, then show welcome caption
    const startTimer = window.setTimeout(() => {
      if (cancelled) return;
      if (theme.status === 'coming_soon') {
        setGuidePose('hint');
        void playLine('common_coming_soon');
        return;
      }
      // The guide introduces itself: waves and talks for the whole line, then settles
      setPhase('intro');
      setGuidePose('welcome');
      void playLine(theme.welcomeLine, { name }).then(() => {
        if (cancelled) return;
        setGuidePose('cheer');
        setPhase('menu');
        idleTimer = window.setTimeout(() => {
          if (!cancelled) setGuidePose('idle');
        }, 1400);
      });
    }, 40);
    return () => {
      cancelled = true;
      window.clearTimeout(startTimer);
      window.clearTimeout(idleTimer);
    };
  }, [theme, name]);

  useEffect(() => {
    if (!theme || !completedAll) return;
    if (state.stickers[theme.id]) return;
    dispatch({ type: 'UNLOCK_STICKER', themeId: theme.id });
    playLine(theme.completeLine, { name });
    playSfx('cheer');
    setRewardOpen(true);
  }, [completedAll, theme, dispatch, name, state.stickers]);

  useIdleHint({
    enabled: Boolean(theme) && theme?.status === 'ready' && !rewardOpen && lockFlow === 'none',
    onIdle: () => {
      setGuidePose('tilt');
      if (theme) playLine(theme.welcomeLine, { name });
    },
  });

  const reactGuide = () => {
    playSfx('tap');
    setGuidePose('welcome');
    window.setTimeout(() => setGuidePose('idle'), 1600);
  };

  if (!theme) {
    return (
      <div className={styles.page}>
              <TopBar backTo="map" />
        <p className={styles.soon}>搵唔到呢個主題</p>
      </div>
    );
  }

  if (theme.status === 'coming_soon') {
    return (
      <div className={styles.page}>
      <SceneBackground src={theme?.bg} wash={0.25} />
        <TopBar backTo="map" />
        <Subtitle />
        <h1 className={styles.title}>{theme.title[lang]}</h1>
        <Guide id={theme.guide} pose={guidePose} size={160} showName onClick={reactGuide} />
        <p className={styles.soon}>即將推出，好快就會開放㗎！</p>
      </div>
    );
  }

  const openActivity = (activityId: string, index: number) => {
    playSfx('tap');
    setGuidePose('idle');
    const locked = isActivityLocked(index, state.surveyUnlocked);
    if (locked) {
      if (accessConfig.mode === 'paid') {
        setLockFlow('paid');
        return;
      }
      setLockFlow('gate');
      return;
    }
    navigate({ name: 'activity', themeId: theme.id, activityId });
  };

  return (
    <div className={styles.page}>
      <SceneBackground src={theme?.bg} wash={0.25} />
      <TopBar backTo="map" />
      <Subtitle />

      <h1 className={[styles.title, phase === 'intro' ? styles.titleIntro : ''].join(' ')}>
        {theme.title[lang]}
      </h1>

      {/* The festival guide: centre stage while introducing itself, then steps to the left */}
      <motion.div
        className={styles.bigGuide}
        initial={{ left: '50%', x: '-50%', y: '30%', opacity: 0 }}
        animate={
          phase === 'intro'
            ? { left: '50%', x: '-50%', y: '0%', opacity: 1, scale: 1.12 }
            : { left: '0%', x: '-10%', y: '0%', opacity: 1, scale: 1 }
        }
        transition={{ type: 'spring', stiffness: 70, damping: 16 }}
        onClick={phase === 'intro' ? skipIntro : reactGuide}
      >
        <AnimatePresence>
          {phase === 'intro' && (
            <motion.div
              className={styles.bubble}
              initial={{ scale: 0.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.3, opacity: 0 }}
            >
              我係{guideInfo[theme.guide].name}！
            </motion.div>
          )}
        </AnimatePresence>
        <BigGuideImage id={theme.guide} pose={guidePose} />
      </motion.div>

      {/* The child's zodiac joins from the right once the menu opens */}
      {state.profile && (
        <motion.div
          className={styles.bigZodiac}
          initial={{ x: '120%', opacity: 0 }}
          animate={phase === 'menu' ? { x: '10%', y: '0%', opacity: 1 } : { x: '120%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 80, damping: 15, delay: 0.25 }}
        >
          <Avatar head={state.profile.head} size={560} />
        </motion.div>
      )}

      <AnimatePresence>
        {phase === 'menu' && (
          <motion.div className={styles.cards} initial="hidden" animate="show" exit="hidden">
            {theme.activities.map((activity, index) => {
              const done = Boolean(state.completed[activity.id]);
              const locked = isActivityLocked(index, state.surveyUnlocked);
              return (
                <motion.button
                  key={activity.id}
                  type="button"
                  className={[styles.card, locked ? styles.cardLocked : ''].filter(Boolean).join(' ')}
                  style={{ backgroundImage: `url(${assets.ui.card})` }}
                  onClick={() => openActivity(activity.id, index)}
                  variants={{
                    hidden: { opacity: 0, scale: 0.6, y: 30 },
                    show: { opacity: 1, scale: 1, y: 0, transition: { delay: 0.35 + index * 0.15, type: 'spring', stiffness: 260, damping: 18 } },
                  }}
                >
                  <img
                    className={styles.icon}
                    src={activity.icon ?? activityIconSrc[activity.type] ?? assets.ui.iconStar}
                    onError={(e) => {
                      e.currentTarget.src = assets.ui.iconStar;
                    }}
                    alt=""
                    width={72}
                    height={72}
                    decoding="async"
                    draggable={false}
                  />
                  <span>{activity.title[lang]}</span>
                  {done && !locked && <span className={styles.check}>✓</span>}
                  {locked && (
                    <span className={styles.lock} aria-label="未解鎖">
                      <img src={assets.ui.iconHome} alt="" width={28} height={28} decoding="async" draggable={false} />
                    </span>
                  )}
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <StickerReward open={rewardOpen} themeId={theme.id} title={theme.sticker.name[lang]} />

      <ParentGate
        open={lockFlow === 'gate'}
        title="解鎖更多內容"
        description="請家長按住 3 秒，然後填寫問卷解鎖（以信任為本，唔會核實）。"
        onSuccess={() => setLockFlow('survey')}
        onCancel={() => setLockFlow('none')}
      />

      {lockFlow === 'survey' && (
        <div className={styles.lockPanel} role="dialog" aria-label="問卷解鎖">
          <h2>填寫問卷解鎖</h2>
          <p>開啟問卷後，返嚟撳「我已填寫問卷」就可以繼續玩其餘活動。</p>
          <BigButton
            onClick={() => window.open(appConfig.surveyUrl, '_blank', 'noopener,noreferrer')}
          >
            開啟問卷
          </BigButton>
          <BigButton
            variant="secondary"
            onClick={() => {
              dispatch({ type: 'SET_SURVEY_UNLOCKED', value: true });
              playSfx('success');
              setLockFlow('none');
            }}
          >
            我已填寫問卷
          </BigButton>
          <BigButton variant="ghost" onClick={() => setLockFlow('none')}>
            取消
          </BigButton>
        </div>
      )}

      {lockFlow === 'paid' && (
        <div className={styles.lockPanel} role="dialog" aria-label="敬請期待">
          <h2>敬請期待</h2>
          <p>{appConfig.paidComingSoon[lang]}</p>
          <BigButton variant="secondary" onClick={() => setLockFlow('none')}>
            知道喇
          </BigButton>
        </div>
      )}
    </div>
  );
}

const bigPoseAnim: Record<GuidePose, TargetAndTransition> = {
  idle: { y: [0, -6, 0], rotate: 0, transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' } },
  talk: { y: [0, -8, 0], transition: { duration: 0.6, repeat: Infinity } },
  welcome: { y: [0, -14, 0, -8, 0], rotate: [0, -3, 3, 0], transition: { duration: 1, repeat: Infinity, ease: 'easeInOut' } },
  cheer: { y: [0, -26, 0], scale: [1, 1.04, 1], transition: { duration: 0.6, repeat: 2 } },
  hint: { rotate: [0, -5, -2, -5], transition: { duration: 1.2, repeat: Infinity } },
  tilt: { rotate: [0, -5, -2, -5], transition: { duration: 1.2, repeat: Infinity } },
};

/** Large, half-body guide picture; new guides fall back to an older guide until their art exists. */
function BigGuideImage({ id, pose }: { id: FestivalGuideId; pose: GuidePose }) {
  const [missing, setMissing] = useState(false);
  const src = guidePoseSrc(missing ? guideInfo[id].fallback : id, pose);
  return (
    <motion.img
      key={src}
      className={styles.bigGuideImg}
      src={src}
      alt=""
      decoding="async"
      draggable={false}
      onError={() => setMissing(true)}
      animate={bigPoseAnim[pose]}
      style={{ originY: 1 }}
    />
  );
}
