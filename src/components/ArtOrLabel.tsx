import { useState, type CSSProperties } from 'react';

type Props = {
  src: string;
  /** Shown on a soft placeholder card while the real picture has not been added yet. */
  label: string;
  className?: string;
  style?: CSSProperties;
  width?: number | string;
  height?: number | string;
};

const PLACEHOLDER_COLORS = ['#ffd8a8', '#ffc9c9', '#c3fae8', '#d0ebff', '#e5dbff', '#fff3bf'];

function colorFor(label: string): string {
  let h = 0;
  for (const ch of label) h = (h * 31 + ch.charCodeAt(0)) % 997;
  return PLACEHOLDER_COLORS[h % PLACEHOLDER_COLORS.length];
}

/**
 * Art picture that degrades to a labelled card when the file is missing,
 * so new themes are playable before the Firefly art is dropped into public/assets.
 */
export function ArtOrLabel({ src, label, className, style, width, height }: Props) {
  const [missing, setMissing] = useState(false);

  if (missing) {
    return (
      <span
        className={className}
        style={{
          display: 'grid',
          placeItems: 'center',
          width: width ?? '100%',
          height: height ?? '100%',
          borderRadius: '50%',
          background: colorFor(label),
          color: '#5a3d1e',
          fontWeight: 700,
          fontSize: 'var(--subtitle-size)',
          lineHeight: 1.1,
          textAlign: 'center',
          padding: 6,
          boxShadow: 'inset 0 -4px 0 rgba(0,0,0,0.08)',
          ...style,
        }}
        aria-hidden
      >
        {label}
      </span>
    );
  }

  return (
    <img
      className={className}
      style={style}
      src={src}
      alt=""
      width={width}
      height={height}
      decoding="async"
      draggable={false}
      onError={() => setMissing(true)}
    />
  );
}
