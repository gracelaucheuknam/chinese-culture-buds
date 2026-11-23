import { assets } from '../assets';
import type { StoryConfig } from './types';

const sun = assets.midautumn.props.sunHot;
const star = assets.midautumn.props.starOff;

/** Ten suns scattered across the hot sky (scene 1). */
const tenSuns = [
  { id: 'sun1', x: 10, y: 14, size: 78 },
  { id: 'sun2', x: 28, y: 10, size: 86 },
  { id: 'sun3', x: 46, y: 16, size: 72 },
  { id: 'sun4', x: 64, y: 11, size: 84 },
  { id: 'sun5', x: 82, y: 15, size: 76 },
  { id: 'sun6', x: 16, y: 32, size: 70 },
  { id: 'sun7', x: 36, y: 28, size: 80 },
  { id: 'sun8', x: 54, y: 34, size: 74 },
  { id: 'sun9', x: 72, y: 30, size: 82 },
  { id: 'sun10', x: 88, y: 36, size: 68 },
].map((s) => ({
  ...s,
  kind: 'sun_wiggle' as const,
  asset: sun,
}));

/** Nine dismissible suns for scene 3. */
const nineSuns = [
  { id: 'dismiss_sun_0', x: 12, y: 12, size: 82 },
  { id: 'dismiss_sun_1', x: 30, y: 10, size: 78 },
  { id: 'dismiss_sun_2', x: 48, y: 14, size: 86 },
  { id: 'dismiss_sun_3', x: 66, y: 11, size: 80 },
  { id: 'dismiss_sun_4', x: 86, y: 18, size: 74 },
  { id: 'dismiss_sun_5', x: 18, y: 32, size: 76 },
  { id: 'dismiss_sun_6', x: 40, y: 30, size: 84 },
  { id: 'dismiss_sun_7', x: 60, y: 34, size: 78 },
  { id: 'dismiss_sun_8', x: 76, y: 37, size: 82 },
].map((s) => ({
  ...s,
  kind: 'sun_dismiss' as const,
  asset: sun,
}));

export const midautumnStory: StoryConfig = {
  id: 'ma_story',
  themeId: 'midautumn',
  title: { yue: '月亮上的祕密', pu: '月亮上的秘密' },
  idleLine: 'ma_idle',
  scenes: [
    {
      id: 'ma_s1',
      bg: assets.midautumn.story.bgHot,
      lineId: 'ma_story_1',
      hotspots: tenSuns,
      requiredInteractions: 0,
      autoAdvance: true,
    },
    {
      id: 'ma_s2',
      bg: assets.midautumn.story.bgHot,
      lineId: 'ma_story_2',
      characters: [
        {
          id: 'houyi',
          pose: 'cheer',
          right: '14%',
          bottom: '6%',
          width: 'min(32vw, 260px)',
        },
      ],
      autoAdvance: true,
    },
    {
      id: 'ma_s3',
      bg: assets.midautumn.story.bgHot,
      overlayBg: assets.midautumn.story.bgCool,
      lineId: 'ma_story_3',
      hotspots: nineSuns,
      requiredInteractions: 9,
    },
    {
      id: 'ma_s4',
      bg: assets.midautumn.story.bgMoon,
      lineId: 'ma_story_4',
      characters: [
        {
          id: 'change',
          pose: 'cheer',
          right: '22%',
          bottom: '22%',
          width: 'min(26vw, 210px)',
        },
        {
          id: 'puff',
          pose: 'welcome',
          right: '6%',
          bottom: '26%',
          width: 'min(20vw, 160px)',
        },
      ],
      hotspots: [
        { id: 'star1', kind: 'star_glow', x: 12, y: 22, size: 72, asset: star },
        { id: 'star2', kind: 'star_glow', x: 28, y: 12, size: 72, asset: star },
        { id: 'star3', kind: 'star_glow', x: 45, y: 20, size: 72, asset: star },
        { id: 'star4', kind: 'star_glow', x: 62, y: 10, size: 72, asset: star },
        { id: 'star5', kind: 'star_glow', x: 78, y: 24, size: 72, asset: star },
      ],
      requiredInteractions: 5,
    },
    {
      id: 'ma_s5',
      bg: assets.midautumn.story.bgCourtyard,
      lineId: 'ma_story_5',
      showPlayer: true,
      playerOutfit: 'midautumn',
      characters: [
        {
          id: 'family_grandpa',
          src: assets.characters.family.grandpa,
          left: '4%',
          bottom: '8%',
          width: 'min(18vw, 140px)',
        },
        {
          id: 'family_grandma',
          src: assets.characters.family.grandma,
          left: '18%',
          bottom: '6%',
          width: 'min(17vw, 132px)',
        },
        {
          id: 'family_dad',
          src: assets.characters.family.dad,
          right: '22%',
          bottom: '7%',
          width: 'min(18vw, 140px)',
        },
        {
          id: 'family_mum',
          src: assets.characters.family.mum,
          right: '6%',
          bottom: '6%',
          width: 'min(17vw, 132px)',
        },
      ],
      hotspots: [
        {
          id: 'mooncake',
          kind: 'label_bounce',
          x: 36,
          y: 58,
          size: 88,
          asset: assets.midautumn.props.mooncake,
          label: { yue: '月餅！', pu: '月饼！' },
        },
        {
          id: 'lantern',
          kind: 'label_bounce',
          x: 50,
          y: 52,
          size: 92,
          asset: assets.midautumn.props.lantern,
          label: { yue: '燈籠！', pu: '灯笼！' },
        },
        {
          id: 'pomelo',
          kind: 'label_bounce',
          x: 64,
          y: 58,
          size: 88,
          asset: assets.midautumn.props.pomelo,
          label: { yue: '柚子！', pu: '柚子！' },
        },
      ],
      requiredInteractions: 0,
      autoAdvance: true,
    },
    {
      id: 'ma_s6',
      bg: assets.midautumn.story.bgMoon,
      lineId: 'ma_story_6',
      characters: [
        {
          id: 'puff',
          pose: 'cheer',
          right: '14%',
          bottom: '24%',
          width: 'min(24vw, 190px)',
        },
      ],
      hotspots: [
        { id: 'star_a', kind: 'star_glow', x: 16, y: 18, size: 68, asset: star },
        { id: 'star_b', kind: 'star_glow', x: 34, y: 12, size: 68, asset: star },
        { id: 'star_c', kind: 'star_glow', x: 52, y: 20, size: 68, asset: star },
        { id: 'star_d', kind: 'star_glow', x: 70, y: 14, size: 68, asset: star },
        { id: 'star_e', kind: 'star_glow', x: 86, y: 22, size: 68, asset: star },
      ],
      requiredInteractions: 0,
      autoAdvance: true,
    },
  ],
};
