import {
  useCallback,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from 'react';

export type Point = { x: number; y: number };

export type DragTarget = {
  id: string;
  /** Center of the snap target in the same coordinate space as drag position. */
  center: Point;
  /** Width of the draggable (used for 40% snap threshold). */
  width: number;
};

type DragState = {
  id: string | null;
  x: number;
  y: number;
  dragging: boolean;
};

type Options = {
  /** Initial positions keyed by item id (top-left of item). */
  initial: Record<string, Point>;
  targets: DragTarget[];
  itemSize: { width: number; height: number };
  /** If provided, piece only snaps when this returns true. */
  matchTarget?: (pieceId: string, targetId: string) => boolean;
  onSnap?: (id: string, targetId: string) => void;
  onMiss?: (id: string) => void;
};

function distance(a: Point, b: Point): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function useDrag({ initial, targets, itemSize, matchTarget, onSnap, onMiss }: Options) {
  const [positions, setPositions] = useState<Record<string, Point>>(initial);
  const [drag, setDrag] = useState<DragState>({ id: null, x: 0, y: 0, dragging: false });
  const originRef = useRef<Point>({ x: 0, y: 0 });
  const startPosRef = useRef<Point>({ x: 0, y: 0 });
  const snappedRef = useRef<Set<string>>(new Set());

  const resetPositions = useCallback((next: Record<string, Point>) => {
    setPositions(next);
    snappedRef.current = new Set();
  }, []);

  const onPointerDown = useCallback(
    (id: string, event: ReactPointerEvent<HTMLElement>) => {
      if (snappedRef.current.has(id)) return;
      event.currentTarget.setPointerCapture(event.pointerId);
      const pos = positions[id] ?? { x: 0, y: 0 };
      originRef.current = { x: event.clientX, y: event.clientY };
      startPosRef.current = pos;
      setDrag({ id, x: pos.x, y: pos.y, dragging: true });
    },
    [positions],
  );

  const onPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (!drag.dragging || !drag.id) return;
      const dx = event.clientX - originRef.current.x;
      const dy = event.clientY - originRef.current.y;
      setDrag((prev) => ({
        ...prev,
        x: startPosRef.current.x + dx,
        y: startPosRef.current.y + dy,
      }));
    },
    [drag.dragging, drag.id],
  );

  const onPointerUp = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (!drag.dragging || !drag.id) return;
      try {
        event.currentTarget.releasePointerCapture(event.pointerId);
      } catch {
        /* already released */
      }

      const id = drag.id;
      const center: Point = {
        x: drag.x + itemSize.width / 2,
        y: drag.y + itemSize.height / 2,
      };

      let best: DragTarget | null = null;
      let bestDist = Infinity;
      for (const target of targets) {
        const d = distance(center, target.center);
        const threshold = target.width * 0.4;
        if (d >= threshold) continue;
        if (matchTarget && !matchTarget(id, target.id)) continue;
        if (d < bestDist) {
          best = target;
          bestDist = d;
        }
      }

      if (best) {
        const snappedPos = {
          x: best.center.x - itemSize.width / 2,
          y: best.center.y - itemSize.height / 2,
        };
        snappedRef.current.add(id);
        setPositions((prev) => ({ ...prev, [id]: snappedPos }));
        onSnap?.(id, best.id);
      } else {
        setPositions((prev) => ({ ...prev, [id]: startPosRef.current }));
        onMiss?.(id);
      }

      setDrag({ id: null, x: 0, y: 0, dragging: false });
    },
    [drag, itemSize.height, itemSize.width, matchTarget, onMiss, onSnap, targets],
  );

  const getStyle = useCallback(
    (id: string): CSSProperties => {
      const pos = drag.dragging && drag.id === id ? { x: drag.x, y: drag.y } : positions[id];
      const active = drag.dragging && drag.id === id;
      return {
        position: 'absolute',
        left: pos?.x ?? 0,
        top: pos?.y ?? 0,
        width: itemSize.width,
        height: itemSize.height,
        transform: active ? 'scale(1.1)' : 'scale(1)',
        boxShadow: active ? '0 12px 24px rgba(58, 42, 26, 0.25)' : 'none',
        zIndex: active ? 10 : 1,
        touchAction: 'none',
        cursor: snappedRef.current.has(id) ? 'default' : 'grab',
      };
    },
    [drag, itemSize.height, itemSize.width, positions],
  );

  const bindDrag = useCallback(
    (id: string) => ({
      onPointerDown: (e: ReactPointerEvent<HTMLElement>) => onPointerDown(id, e),
      onPointerMove,
      onPointerUp,
      onPointerCancel: onPointerUp,
      style: getStyle(id),
    }),
    [getStyle, onPointerDown, onPointerMove, onPointerUp],
  );

  return {
    positions,
    drag,
    bindDrag,
    resetPositions,
    isSnapped: (id: string) => snappedRef.current.has(id),
  };
}
