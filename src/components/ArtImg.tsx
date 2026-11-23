import type { ImgHTMLAttributes } from 'react';

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, 'draggable' | 'decoding'> & {
  /** Prefer explicit dimensions to reduce layout shift. */
  width?: number | string;
  height?: number | string;
};

/** Standard art `<img>` with async decode + no-drag defaults. */
export function ArtImg({ alt = '', width, height, ...rest }: Props) {
  return (
    <img
      alt={alt}
      width={width}
      height={height}
      decoding="async"
      draggable={false}
      {...rest}
    />
  );
}
