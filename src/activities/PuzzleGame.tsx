import type { FestivalGuideId } from '../content/assets';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BigButton } from '../components/BigButton';
import { Guide } from '../components/Guide';
import { Subtitle } from '../components/Subtitle';
import { TopBar } from '../components/TopBar';
import { assets } from '../content/assets';
import { playLine, playSfx } from '../engine/audio';
import { useDrag } from '../engine/useDrag';
import { useIdleHint } from '../engine/useIdleHint';
import styles from './PuzzleGame.module.css';

const GAP = 24;

/** Piece size grows with the screen (iPad ≈ 150px) but never below a K1-friendly 110px. */
function pieceSizeFor(w: number, h: number): number {
  return Math.round(Math.max(110, Math.min(170, w * 0.14, (h - 220) / 2.3)));
}

type PieceId = '0' | '1' | '2' | '3';

const PIECES: PieceId[] = ['0', '1', '2', '3'];

const BG_POS: Record<PieceId, string> = {
  '0': '0% 0%',
  '1': '100% 0%',
  '2': '0% 100%',
  '3': '100% 100%',
};

const SLOT_INDEX: Record<PieceId, { col: number; row: number }> = {
  '0': { col: 0, row: 0 },
  '1': { col: 1, row: 0 },
  '2': { col: 0, row: 1 },
  '3': { col: 1, row: 1 },
};

export type PuzzleConfig = {
  themeId: string;
  guide: FestivalGuideId;
  title: string;
  images: string[];
  lines: { intro: string; good: string; retry: string; next: string; idle: string };
};

const MIDAUTUMN_PUZZLE: PuzzleConfig = {
  themeId: 'midautumn',
  guide: 'puff',
  title: '中秋團圓小拼圖',
  images: [assets.midautumn.puzzle.puzzle1, assets.midautumn.puzzle.puzzle2],
  lines: {
    intro: 'ma_puzzle_intro',
    good: 'ma_puzzle_good',
    retry: 'ma_puzzle_retry',
    next: 'ma_puzzle_next',
    idle: 'ma_idle',
  },
};

/** Simple colourful stand-in picture so a puzzle stays playable before its art exists. */
function placeholderPicture(seed: number): string {
  const palettes = [
    ['#ff8a80', '#ffd180', '#ffe57f', '#ff6e40'],
    ['#80d8ff', '#b9f6ca', '#ffe57f', '#ea80fc'],
  ];
  const [a, b, c, d] = palettes[seed % palettes.length];
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'><rect width='100' height='100' fill='${a}'/><rect x='100' width='100' height='100' fill='${b}'/><rect y='100' width='100' height='100' fill='${c}'/><rect x='100' y='100' width='100' height='100' fill='${d}'/><circle cx='100' cy='100' r='62' fill='#fff' opacity='0.85'/><circle cx='78' cy='88' r='9' fill='#5a3d1e'/><circle cx='122' cy='88' r='9' fill='#5a3d1e'/><path d='M74 118 Q100 142 126 118' stroke='#5a3d1e' stroke-width='7' fill='none' stroke-linecap='round'/></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

type Props = {
  config?: PuzzleConfig;
  onComplete: () => void;
};

function shuffle<T>(arr: T[]): T[] {
  const next = [...arr];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function buildInitialPositions(boardW: number, boardH: number, PIECE: number) {
  const FRAME = PIECE * 2;
  const frameTop = (boardH - FRAME) / 2;
  const order = shuffle(PIECES);
  const positions: Record<string, { x: number; y: number }> = {};
  order.forEach((id, i) => {
    const leftSide = i < 2;
    positions[id] = {
      x: leftSide ? 0 : boardW - PIECE,
      y: frameTop + (i % 2) * PIECE,
    };
  });
  return positions;
}

export function PuzzleGame({ config = MIDAUTUMN_PUZZLE, onComplete }: Props) {
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [celebrate, setCelebrate] = useState(false);
  const [snappedCount, setSnappedCount] = useState(0);
  const [PIECE] = useState(() => pieceSizeFor(window.innerWidth, window.innerHeight));
  const FRAME = PIECE * 2;
  const boardSize = useMemo(() => ({ w: FRAME + 2 * PIECE + 2 * GAP, h: FRAME }), [FRAME, PIECE]);
  const [deal, setDeal] = useState(0);
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const puzzleIndexRef = useRef(puzzleIndex);
  useEffect(() => {
    puzzleIndexRef.current = puzzleIndex;
  }, [puzzleIndex]);

  const [missing, setMissing] = useState<Record<number, true>>({});
  const total = config.images.length;
  const rawSrc = config.images[puzzleIndex];
  const imageSrc = missing[puzzleIndex] ? placeholderPicture(puzzleIndex) : rawSrc;
  useEffect(() => {
    // probe the picture; swap in a stand-in when the art has not been added yet
    const probe = new Image();
    probe.onerror = () => setMissing((m) => ({ ...m, [puzzleIndex]: true }));
    probe.src = rawSrc;
  }, [rawSrc, puzzleIndex]);

  const frameOrigin = useMemo(
    () => ({
      x: (boardSize.w - FRAME) / 2,
      y: (boardSize.h - FRAME) / 2,
    }),
    [boardSize.h, boardSize.w, FRAME],
  );

  const targets = useMemo(
    () =>
      PIECES.map((id) => ({
        id,
        center: {
          x: frameOrigin.x + SLOT_INDEX[id].col * PIECE + PIECE / 2,
          y: frameOrigin.y + SLOT_INDEX[id].row * PIECE + PIECE / 2,
        },
        // generous snap zone for small fingers
        width: PIECE * 1.5,
      })),
    [frameOrigin.x, frameOrigin.y, PIECE],
  );

  const initial = useMemo(
    () => buildInitialPositions(boardSize.w, boardSize.h, PIECE),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [boardSize.h, boardSize.w, PIECE, puzzleIndex, deal],
  );

  const onSnap = useCallback(() => {
    playSfx('snap');
    void playLine(config.lines.good);
    setSnappedCount((n) => n + 1);
  }, [config.lines.good]);

  const onMiss = useCallback(() => {
    void playLine(config.lines.retry);
  }, [config.lines.retry]);

  const { bindDrag, resetPositions } = useDrag({
    initial,
    targets,
    itemSize: { width: PIECE, height: PIECE },
    matchTarget: (pieceId, targetId) => pieceId === targetId,
    onSnap,
    onMiss,
  });

  useEffect(() => {
    resetPositions(initial);
    void playLine(puzzleIndex === 0 ? config.lines.intro : config.lines.next);
  }, [puzzleIndex, deal, initial, resetPositions, config.lines.intro, config.lines.next]);

  useEffect(() => {
    if (snappedCount < 4) return;
    setCelebrate(true);
    playSfx('cheer');
    const t = window.setTimeout(() => {
      if (puzzleIndexRef.current + 1 < total) {
        setCelebrate(false);
        setSnappedCount(0);
        setPuzzleIndex((i) => i + 1);
        setDeal((d) => d + 1);
      } else {
        onCompleteRef.current();
      }
    }, 1600);
    return () => window.clearTimeout(t);
  }, [snappedCount, total]);

  useIdleHint({
    enabled: snappedCount < 4 && !celebrate,
    onIdle: () => void playLine(config.lines.idle),
  });

  return (
    <div className={`${styles.page} ${celebrate ? styles.celebrate : ''}`}>
      <TopBar backTo="theme" themeId={config.themeId} />
      <Subtitle />
      <Guide id={config.guide} pose={celebrate ? 'cheer' : 'talk'} size={90} />
      <h1 className={styles.title}>
        {config.title}（{puzzleIndex + 1}/{total}）
      </h1>
      {celebrate && <div className={styles.doneBanner}>拼好啦！</div>}

      <div
        className={`${styles.board} drag-surface`}
        style={{ width: boardSize.w, height: boardSize.h, ['--piece' as string]: `${FRAME}px` }}
      >
        <div className={styles.frame} style={{ width: FRAME, height: FRAME }}>
          <div
            className={styles.ghost}
            style={{ backgroundImage: `url("${imageSrc}")` }}
            aria-hidden
          />
          {PIECES.map((id) => (
            <div
              key={`slot-${id}`}
              className={styles.slot}
              style={{
                left: SLOT_INDEX[id].col * PIECE,
                top: SLOT_INDEX[id].row * PIECE,
                width: PIECE,
                height: PIECE,
              }}
            />
          ))}
        </div>

        {PIECES.map((id) => {
          const bind = bindDrag(id);
          return (
            <div
              key={`${puzzleIndex}-${deal}-${id}`}
              className={styles.piece}
              {...bind}
              style={{
                ...bind.style,
                backgroundImage: `url("${imageSrc}")`,
                backgroundPosition: BG_POS[id],
              }}
            />
          );
        })}
      </div>

      <BigButton
        variant="ghost"
        onClick={() => {
          setSnappedCount(0);
          setCelebrate(false);
          setDeal((d) => d + 1);
        }}
      >
        重設呢幅
      </BigButton>
    </div>
  );
}
