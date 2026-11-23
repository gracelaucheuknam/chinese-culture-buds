import { dragonboat } from './dragonboat';
import { midautumn } from './midautumn';
import { newyear } from './newyear';
import { yumcha } from './yumcha';
import type { Theme } from './types';

/** Map display order (left → right). */
export const themes: Theme[] = [newyear, midautumn, dragonboat, yumcha];

const byId = new Map(themes.map((t) => [t.id, t]));

export function getTheme(id: string): Theme | undefined {
  return byId.get(id);
}

export function getReadyThemes(): Theme[] {
  return themes.filter((t) => t.status === 'ready');
}

export type { Theme, ActivityConfig, ThemeStatus } from './types';
