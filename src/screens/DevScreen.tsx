import { useMemo, useState } from 'react';
import { BigButton } from '../components/BigButton';
import { Confetti } from '../components/Confetti';
import { ParentGate } from '../components/ParentGate';
import { Subtitle } from '../components/Subtitle';
import { TopBar } from '../components/TopBar';
import { playLine, playSfx, unlockAudio } from '../engine/audio';
import { useProgress } from '../engine/progress';
import { useDrag } from '../engine/useDrag';
import { useIdleHint } from '../engine/useIdleHint';
import type { Lang } from '../content/types';
import styles from './DevScreen.module.css';

const ITEM = { width: 88, height: 88 };

export function DevScreen() {
  const { state, dispatch } = useProgress();
  const [gateOpen, setGateOpen] = useState(false);
  const [gateOk, setGateOk] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [idleMsg, setIdleMsg] = useState(false);
  const [dragMsg, setDragMsg] = useState('把橙色方塊拖到綠色框');

  const name = state.profile?.name ?? '小朋友';
  const lang = state.profile?.lang ?? 'yue';

  useIdleHint({
    enabled: true,
    onIdle: () => {
      setIdleMsg(true);
      playLine('common_idle');
    },
  });

  const targets = useMemo(
    () => [{ id: 'slot', center: { x: 360, y: 110 }, width: ITEM.width }],
    [],
  );

  const { bindDrag, resetPositions } = useDrag({
    initial: { piece: { x: 24, y: 66 } },
    targets,
    itemSize: ITEM,
    onSnap: () => {
      setDragMsg('吸附成功！');
      playSfx('snap');
      playLine('common_good');
      setConfetti(true);
      window.setTimeout(() => setConfetti(false), 1800);
    },
    onMiss: () => {
      setDragMsg('差少少，再試吓');
      playLine('common_retry');
    },
  });

  const setLang = (next: Lang) => {
    dispatch({ type: 'UPDATE_PROFILE', patch: { lang: next } });
  };

  return (
    <div className={styles.page}>
      <TopBar backTo="start" />
      <Confetti active={confetti} />
      <Subtitle />

      <h1>Dev 測試頁</h1>
      <p className={styles.status}>
        名字：{name}　語言：{lang}　聲音：{state.settings.sound ? '開' : '關'}　字幕：
        {state.settings.subtitles ? '開' : '關'}　白板：
        {state.settings.whiteboardMode ? '開' : '關'}
      </p>

      <section className={styles.section}>
        <h2>1. 音訊／對白</h2>
        <div className={styles.row}>
          <BigButton
            onClick={() => {
              void unlockAudio();
              playLine('common_hello', { name });
            }}
          >
            播放歡迎對白
          </BigButton>
          <BigButton variant="secondary" onClick={() => playSfx('cheer')}>
            播放音效
          </BigButton>
          <BigButton variant="ghost" onClick={() => setLang(lang === 'yue' ? 'pu' : 'yue')}>
            切換粵／普（而家：{lang === 'yue' ? '粵語' : '普通話'}）
          </BigButton>
        </div>
      </section>

      <section className={styles.section}>
        <h2>2. 拖拽吸附</h2>
        <p className={styles.status}>{dragMsg}</p>
        <div className={`${styles.dragArea} drag-surface`}>
          <div
            className={styles.target}
            style={{
              left: targets[0].center.x - ITEM.width / 2,
              top: targets[0].center.y - ITEM.height / 2,
              width: ITEM.width,
              height: ITEM.height,
            }}
          >
            目標
          </div>
          <div className={styles.piece} {...bindDrag('piece')}>
            拖我
          </div>
        </div>
        <BigButton
          variant="secondary"
          onClick={() => {
            resetPositions({ piece: { x: 24, y: 66 } });
            setDragMsg('把橙色方塊拖到綠色框');
          }}
        >
          重設拖拽
        </BigButton>
      </section>

      <section className={styles.section}>
        <h2>3. 閒置提示（8 秒）</h2>
        {idleMsg ? (
          <div className={styles.idleBanner}>已觸發閒置提示（繼續操作會再計時）</div>
        ) : (
          <p className={styles.status}>停手 8 秒會聽到／看到提示</p>
        )}
        <BigButton variant="ghost" onClick={() => setIdleMsg(false)}>
          清除提示狀態
        </BigButton>
      </section>

      <section className={styles.section}>
        <h2>4. ParentGate / Confetti / 設定</h2>
        <div className={styles.row}>
          <BigButton onClick={() => setGateOpen(true)}>打開家長鎖</BigButton>
          <BigButton
            variant="secondary"
            onClick={() => {
              setConfetti(true);
              window.setTimeout(() => setConfetti(false), 1800);
            }}
          >
            撒花
          </BigButton>
          <BigButton
            variant="ghost"
            onClick={() =>
              dispatch({
                type: 'UPDATE_SETTINGS',
                patch: { whiteboardMode: !state.settings.whiteboardMode },
              })
            }
          >
            電子白板模式
          </BigButton>
          <BigButton
            variant="ghost"
            onClick={() =>
              dispatch({
                type: 'SET_PROFILE',
                profile: {
                  name: '小測試',
                  head: 'rabbit',
                  gender: 'girl',
                  lang,
                },
              })
            }
          >
            寫入測試角色
          </BigButton>
        </div>
        {gateOk && <p className={styles.status}>家長鎖已通過 ✓（重新整理後設定會保留）</p>}
      </section>

      <ParentGate
        open={gateOpen}
        onSuccess={() => {
          setGateOpen(false);
          setGateOk(true);
        }}
        onCancel={() => setGateOpen(false)}
      />
    </div>
  );
}
