import type { FestivalGuideId } from '../assets';
import type { LocalizedText, OutfitId } from '../types';

export type ThemeStatus = 'ready' | 'coming_soon';

export type ActivityType = 'story' | 'lantern' | 'puzzle' | 'zongzi' | 'race' | 'choice';

export type ActivityConfig = {
  id: string;
  type: ActivityType;
  title: LocalizedText;
  /** Card icon on the theme home (defaults by type). */
  icon?: string;
  /** Extra config consumed by activity components (see PuzzleConfig / ChoiceConfig). */
  config?: Record<string, unknown>;
};

export type Theme = {
  id: string;
  status: ThemeStatus;
  title: LocalizedText;
  guide: FestivalGuideId;
  outfit: OutfitId;
  mapPin: string;
  sticker: { id: string; name: LocalizedText };
  /** Background picture for the theme home and its games. */
  bg?: string;
  welcomeLine: string;
  completeLine: string;
  activities: ActivityConfig[];
};
