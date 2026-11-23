import { avatarLines } from './avatar';
import { commonLines } from './common';
import { dragonboatLines } from './dragonboat';
import { midautumnLines } from './midautumn';
import { newyearLines } from './newyear';
import { yumchaLines } from './yumcha';
import type { Lang, Line } from '../types';

const lineMap = new Map<string, Line>();

export function registerLines(lines: Line[]): void {
  for (const line of lines) {
    lineMap.set(line.id, line);
  }
}

registerLines(commonLines);
registerLines(avatarLines);
registerLines(midautumnLines);
registerLines(dragonboatLines);
registerLines(newyearLines);
registerLines(yumchaLines);

export function getLine(lineId: string): Line | undefined {
  return lineMap.get(lineId);
}

export function resolveLineText(
  lineId: string,
  lang: Lang,
  vars: Record<string, string> = {},
): string | undefined {
  const line = getLine(lineId);
  if (!line) return undefined;
  let text = line[lang];
  for (const [key, value] of Object.entries(vars)) {
    text = text.replaceAll(`{${key}}`, value);
  }
  return text;
}

export function resolveAudioText(lineId: string, lang: Lang): string | undefined {
  const line = getLine(lineId);
  if (!line) return undefined;
  return line.audioText?.[lang] ?? line[lang];
}

export function getAllLines(): Line[] {
  return Array.from(lineMap.values());
}
