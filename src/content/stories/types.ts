import type { OutfitId } from '../types';

export type HotspotKind =
  | 'sun_wiggle'
  | 'sun_dismiss'
  | 'star_glow'
  | 'label_bounce'
  | 'tap_progress'
  | 'character_wave'
  | 'zongzi_toss';

export type StoryHotspot = {
  id: string;
  kind: HotspotKind;
  /** Percent positions within the stage. */
  x: number;
  y: number;
  size?: number;
  /** Spoken / shown label when tapped (e.g. 月餅！). */
  label?: { yue: string; pu: string };
  /** Image URL from content/assets (no emoji). */
  asset?: string;
};

export type StoryCharacter = {
  id: string;
  /** Direct image URL; if omitted, resolve via guide id + pose. */
  src?: string;
  right?: string;
  left?: string;
  bottom?: string;
  width?: string;
  pose?: 'idle' | 'talk' | 'welcome' | 'cheer' | 'hint' | 'tilt';
  zIndex?: number;
};

export type StoryAmbient = {
  id: string;
  src: string;
  /** Vertical position as % of stage height. */
  y: number;
  size?: number;
  direction?: 'ltr' | 'rtl';
  duration?: number;
  delay?: number;
};

export type StoryScene = {
  id: string;
  /** Absolute URL under /assets/...webp */
  bg: string;
  /** Optional second bg that fades in as dismiss interactions complete (e.g. cool village). */
  overlayBg?: string;
  fg?: string;
  lineId: string;
  /** Show player avatar in this scene. */
  showPlayer?: boolean;
  playerOutfit?: OutfitId;
  characters?: StoryCharacter[];
  hotspots?: StoryHotspot[];
  ambient?: StoryAmbient[];
  /**
   * How many hotspot interactions are required before advancing.
   * Defaults to 0 (auto after narration when autoAdvance).
   */
  requiredInteractions?: number;
  /** If true, advance automatically after narration (and optional wait). */
  autoAdvance?: boolean;
};

export type StoryConfig = {
  id: string;
  themeId: string;
  title: { yue: string; pu: string };
  idleLine?: string;
  scenes: StoryScene[];
};
