import { useEffect, useRef } from 'react';
import { BigButton } from '../components/BigButton';
import { GuideLineup } from '../components/GuideLineup';
import { SceneBackground } from '../components/SceneBackground';
import { assets } from '../content/assets';
import { Subtitle } from '../components/Subtitle';
import { playLine, unlockAudio } from '../engine/audio';
import { useProgress } from '../engine/progress';
import { navigate } from '../engine/routing';
import styles from './StartScreen.module.css';

export function StartScreen() {
  const { state } = useProgress();
  const profile = state.profile;
  const welcomedRef = useRef(false);

  useEffect(() => {
    if (!profile || welcomedRef.current) return;
    welcomedRef.current = true;
    playLine('start_welcome_back', { name: profile.name });
    const t = window.setTimeout(() => navigate({ name: 'map' }), 1600);
    return () => window.clearTimeout(t);
  }, [profile]);

  const start = async () => {
    await unlockAudio();
    if (profile) {
      navigate({ name: 'map' });
      return;
    }
    navigate({ name: 'avatar' });
  };

  return (
    <div className={styles.page}>
      <SceneBackground src={assets.screens.cover} wash={0.15} />
      <Subtitle />
      <h1 className={styles.brand}>童心樂中華</h1>

      {profile ? (
        <p className={styles.hint}>歡迎返嚟，{profile.name}！</p>
      ) : (
        <p className={styles.hint}>一齊嚟認識中華文化啦！</p>
      )}

      <div className={styles.actions}>
        <BigButton onClick={() => void start()}>開始</BigButton>
        <BigButton variant="secondary" onClick={() => navigate({ name: 'parents' })}>
          家長／老師
        </BigButton>
      </div>

      <GuideLineup />
    </div>
  );
}
