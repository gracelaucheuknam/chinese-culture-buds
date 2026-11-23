import { assets } from '../assets';
import type { StoryConfig } from './types';

const p = assets.yumcha.props;
const fam = assets.characters.family;

/** 一家人去飲茶 — five short scenes, one idea per scene. */
export const yumchaStory: StoryConfig = {
  id: 'yc_story',
  themeId: 'yumcha',
  title: { yue: '一齊去飲茶', pu: '一起去饮茶' },
  idleLine: 'yc_idle',
  scenes: [
    {
      id: 'yc_s1',
      bg: assets.yumcha.story.bgStreet,
      lineId: 'yc_story_1',
      showPlayer: true,
      characters: [
        { id: 'dad', src: fam.dad, left: '8%', bottom: '6%', width: 'min(18vw, 160px)' },
        { id: 'mum', src: fam.mum, right: '8%', bottom: '6%', width: 'min(18vw, 160px)' },
      ],
      autoAdvance: true,
    },
    {
      id: 'yc_s2',
      bg: assets.yumcha.story.bgTeahouse,
      lineId: 'yc_story_2',
      characters: [
        { id: 'grandpa', src: fam.grandpa, left: '6%', bottom: '6%', width: 'min(18vw, 160px)' },
        { id: 'grandma', src: fam.grandma, right: '6%', bottom: '6%', width: 'min(18vw, 160px)' },
      ],
      hotspots: [
        {
          id: 'teapot',
          kind: 'label_bounce',
          x: 50,
          y: 44,
          size: 150,
          asset: p.teapot,
          label: { yue: '茶壺', pu: '茶壶' },
        },
      ],
      autoAdvance: true,
    },
    {
      id: 'yc_s3',
      bg: assets.yumcha.story.bgTeahouse,
      lineId: 'yc_story_3',
      hotspots: [
        {
          id: 'hargow',
          kind: 'label_bounce',
          x: 32,
          y: 50,
          size: 130,
          asset: p.harGow,
          label: { yue: '蝦餃', pu: '虾饺' },
        },
        {
          id: 'siumai',
          kind: 'label_bounce',
          x: 44,
          y: 46,
          size: 130,
          asset: p.siuMai,
          label: { yue: '燒賣', pu: '烧卖' },
        },
        {
          id: 'bao',
          kind: 'label_bounce',
          x: 56,
          y: 46,
          size: 130,
          asset: p.charSiuBao,
          label: { yue: '叉燒包', pu: '叉烧包' },
        },
        {
          id: 'tart',
          kind: 'label_bounce',
          x: 68,
          y: 50,
          size: 130,
          asset: p.eggTart,
          label: { yue: '蛋撻', pu: '蛋挞' },
        },
      ],
      autoAdvance: true,
    },
    {
      id: 'yc_s4',
      bg: assets.yumcha.story.bgTeahouse,
      lineId: 'yc_story_4',
      showPlayer: true,
      hotspots: [
        {
          id: 'cup',
          kind: 'label_bounce',
          x: 50,
          y: 48,
          size: 120,
          asset: p.teacup,
          label: { yue: '多謝！', pu: '谢谢！' },
        },
      ],
      autoAdvance: true,
    },
    {
      id: 'yc_s5',
      bg: assets.yumcha.story.bgTeahouse,
      lineId: 'yc_story_5',
      showPlayer: true,
      characters: [
        { id: 'baobao', pose: 'cheer', left: '8%', bottom: '6%', width: 'min(18vw, 150px)' },
        { id: 'grandma', src: fam.grandma, right: '6%', bottom: '6%', width: 'min(18vw, 160px)' },
      ],
      autoAdvance: true,
    },
  ],
};
