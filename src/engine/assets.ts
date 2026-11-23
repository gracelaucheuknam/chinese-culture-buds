/** Central asset path helper — swap file extensions later without touching components. */

function withBase(path: string): string {
  const cleaned = path.replace(/^\/+/, '');
  return `${import.meta.env.BASE_URL}${cleaned}`;
}

export function assetPath(...parts: string[]): string {
  const cleaned = parts
    .join('/')
    .replace(/\\/g, '/')
    .replace(/\/+/g, '/')
    .replace(/^\/+/, '');
  return withBase(`assets/${cleaned}`);
}

export function audioPath(folder: 'yue' | 'pu' | 'sfx' | 'bgm', fileName: string): string {
  return withBase(`audio/${folder}/${fileName}`);
}
