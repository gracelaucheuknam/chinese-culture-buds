import { assets } from '../content/assets';
import { themes } from '../content/themes';
import { Subtitle } from '../components/Subtitle';
import { TopBar } from '../components/TopBar';
import { useProgress } from '../engine/progress';
import { SceneBackground } from '../components/SceneBackground';
import styles from './StickerBook.module.css';

export function StickerBook() {
  const { state } = useProgress();
  const lang = state.profile?.lang ?? 'yue';

  return (
    <div className={styles.page}>
      <SceneBackground src={assets.screens.stickers} wash={0.3} />
      <TopBar backTo="map" />
      <Subtitle />
      <h1 className={styles.title}>貼紙簿</h1>
      <p className={styles.hint}>完成主題就可以攞到金牌貼紙啦！</p>

      <div className={styles.grid}>
        {themes.map((theme) => {
          const owned = Boolean(state.stickers[theme.id]);
          return (
            <div
              key={theme.id}
              className={[styles.slot, owned ? '' : styles.locked].filter(Boolean).join(' ')}
            >
              <img
                src={assets.ui.medal}
                alt=""
                decoding="async"
                draggable={false}
                style={{ opacity: owned ? 1 : 0.25 }}
              />
              <span className={styles.label}>
                {owned ? theme.sticker.name[lang] : theme.title[lang]}
              </span>
              <span className={styles.hint}>
                {owned ? '已獲得' : theme.status === 'coming_soon' ? '即將推出' : '未獲得'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
