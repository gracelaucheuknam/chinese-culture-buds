import { useState } from 'react';
import { accessConfig } from '../config/access';
import { appConfig } from '../config/app';
import { faqItems } from '../content/faq';
import type { Lang } from '../content/types';
import { BigButton } from '../components/BigButton';
import { ParentGate } from '../components/ParentGate';
import { TopBar } from '../components/TopBar';
import { playSfx } from '../engine/audio';
import { useProgress } from '../engine/progress';
import { navigate } from '../engine/routing';
import { assets } from '../content/assets';
import { SceneBackground } from '../components/SceneBackground';
import styles from './ParentsArea.module.css';

export function ParentsArea() {
  const { state, dispatch } = useProgress();
  const [unlocked, setUnlocked] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const lang: Lang = state.profile?.lang ?? appConfig.defaultLang;

  if (!unlocked) {
    return (
      <div className={styles.page}>
      <SceneBackground src={assets.screens.parents} wash={0.55} />
        <ParentGate
          open
          onSuccess={() => setUnlocked(true)}
          onCancel={() => navigate({ name: 'start' })}
        />
      </div>
    );
  }

  const setLang = (next: Lang) => {
    playSfx('tap');
    dispatch({ type: 'UPDATE_PROFILE', patch: { lang: next } });
  };

  return (
    <div className={styles.page}>
      <SceneBackground src={assets.screens.parents} wash={0.55} />
      <TopBar backTo="start" />
      <h1 className={styles.title}>家長／老師專區</h1>
      <p className={styles.note}>
        解鎖模式：<span className={styles.modeBadge}>{accessConfig.mode}</span>
        （可於 <code>src/config/access.ts</code> 修改）
      </p>

      <section className={styles.section}>
        <h2>使用建議</h2>
        <p>{appConfig.usageTips[lang]}</p>
      </section>

      <section className={styles.section}>
        <h2>課堂使用／電子白板</h2>
        <p>{appConfig.classroomTips[lang]}</p>
        <div className={styles.row}>
          <BigButton
            variant={state.settings.whiteboardMode ? 'primary' : 'secondary'}
            onClick={() =>
              dispatch({
                type: 'UPDATE_SETTINGS',
                patch: { whiteboardMode: !state.settings.whiteboardMode },
              })
            }
          >
            電子白板模式：{state.settings.whiteboardMode ? '開' : '關'}
          </BigButton>
        </div>
      </section>

      <section className={styles.section}>
        <h2>語言設定</h2>
        <div className={styles.row}>
          <BigButton variant={lang === 'yue' ? 'primary' : 'secondary'} onClick={() => setLang('yue')}>
            粵語
          </BigButton>
          <BigButton variant={lang === 'pu' ? 'primary' : 'secondary'} onClick={() => setLang('pu')}>
            普通話
          </BigButton>
        </div>
      </section>

      <section className={styles.section}>
        <h2>問卷</h2>
        <p>填寫問卷可以幫助我們改進內容（不會收集小朋友個人資料）。</p>
        <div className={styles.row}>
          <BigButton
            onClick={() => {
              window.open(appConfig.surveyUrl, '_blank', 'noopener,noreferrer');
            }}
          >
            開啟問卷
          </BigButton>
          {!state.surveyUnlocked && (
            <BigButton
              variant="secondary"
              onClick={() => {
                dispatch({ type: 'SET_SURVEY_UNLOCKED', value: true });
                playSfx('success');
              }}
            >
              我已填寫問卷
            </BigButton>
          )}
          {state.surveyUnlocked && <span className={styles.note}>已解鎖問卷內容 ✓</span>}
        </div>
      </section>

      <section className={styles.section}>
        <h2>常見問題</h2>
        {faqItems.map((item) => (
          <div key={item.id} className={styles.faqItem}>
            <strong>Q：{item.q[lang]}</strong>
            <p>A：{item.a[lang]}</p>
          </div>
        ))}
      </section>

      <section className={styles.section}>
        <h2>重設進度</h2>
        <p className={styles.danger}>會清除本機角色、完成紀錄同貼紙，唔可以復原。</p>
        {!confirmReset ? (
          <BigButton variant="secondary" onClick={() => setConfirmReset(true)}>
            重設進度…
          </BigButton>
        ) : (
          <div className={styles.row}>
            <BigButton
              onClick={() => {
                dispatch({ type: 'RESET' });
                setConfirmReset(false);
                playSfx('tap');
                navigate({ name: 'start' });
              }}
            >
              確認重設
            </BigButton>
            <BigButton variant="ghost" onClick={() => setConfirmReset(false)}>
              取消
            </BigButton>
          </div>
        )}
      </section>

      <section className={styles.section}>
        <h2>關於本項目</h2>
        <p>{appConfig.acknowledgements[lang]}</p>
      </section>

      <div className={styles.row} style={{ justifyContent: 'center' }}>
        <BigButton variant="secondary" onClick={() => navigate({ name: 'map' })}>
          返地圖
        </BigButton>
        <BigButton variant="ghost" onClick={() => navigate({ name: 'start' })}>
          返開始
        </BigButton>
      </div>
    </div>
  );
}
