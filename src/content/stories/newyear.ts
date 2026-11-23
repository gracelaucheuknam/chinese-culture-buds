import { assets } from '../assets';
import type { StoryConfig } from './types';

const p = assets.newyear.props;

/** 年獸故事 — five short scenes, one idea per scene. */
export const newyearStory: StoryConfig = {
  id: 'ny_story',
  themeId: 'newyear',
  title: { yue: '年獸嚟咗', pu: '年兽来了' },
  idleLine: 'ny_idle',
  scenes: [
    {
      id: 'ny_s1',
      bg: assets.newyear.story.bgVillageNight,
      lineId: 'ny_story_1',
      hotspots: [
        {
          id: 'nian',
          kind: 'character_wave',
          x: 58,
          y: 30,
          size: 240,
          asset: p.nian,
          label: { yue: '年獸', pu: '年兽' },
        },
      ],
      autoAdvance: true,
    },
    {
      id: 'ny_s2',
      bg: assets.newyear.story.bgVillageNight,
      lineId: 'ny_story_2',
      hotspots: [
        {
          id: 'red',
          kind: 'label_bounce',
          x: 22,
          y: 30,
          size: 150,
          asset: p.lanternRed,
          label: { yue: '紅燈籠', pu: '红灯笼' },
        },
        {
          id: 'loud',
          kind: 'label_bounce',
          x: 64,
          y: 34,
          size: 150,
          asset: p.firecracker,
          label: { yue: '炮仗', pu: '鞭炮' },
        },
      ],
      autoAdvance: true,
    },
    {
      id: 'ny_s3',
      bg: assets.newyear.story.bgVillageNight,
      lineId: 'ny_story_3',
      hotspots: [
        {
          id: 'fc1',
          kind: 'zongzi_toss',
          x: 20,
          y: 42,
          size: 130,
          asset: p.firecracker,
          label: { yue: '炮仗', pu: '鞭炮' },
        },
        {
          id: 'fc2',
          kind: 'zongzi_toss',
          x: 44,
          y: 36,
          size: 130,
          asset: p.firecracker,
          label: { yue: '炮仗', pu: '鞭炮' },
        },
        {
          id: 'fc3',
          kind: 'zongzi_toss',
          x: 68,
          y: 42,
          size: 130,
          asset: p.firecracker,
          label: { yue: '炮仗', pu: '鞭炮' },
        },
      ],
      requiredInteractions: 3,
    },
    {
      id: 'ny_s4',
      bg: assets.newyear.story.bgDoor,
      lineId: 'ny_story_4',
      characters: [
        {
          id: 'grandma',
          src: assets.characters.family.grandma,
          left: '6%',
          bottom: '6%',
          width: 'min(20vw, 170px)',
        },
        { id: 'caicai', pose: 'cheer', right: '8%', bottom: '6%', width: 'min(18vw, 150px)' },
      ],
      hotspots: [
        {
          id: 'faichun',
          kind: 'label_bounce',
          x: 36,
          y: 22,
          size: 150,
          asset: p.faiChun,
          label: { yue: '揮春', pu: '挥春' },
        },
        {
          id: 'lantern',
          kind: 'label_bounce',
          x: 58,
          y: 14,
          size: 130,
          asset: p.lanternRed,
          label: { yue: '紅燈籠', pu: '红灯笼' },
        },
      ],
      autoAdvance: true,
    },
    {
      id: 'ny_s5',
      bg: assets.newyear.story.bgHome,
      lineId: 'ny_story_5',
      showPlayer: true,
      characters: [
        {
          id: 'grandpa',
          src: assets.characters.family.grandpa,
          left: '4%',
          bottom: '6%',
          width: 'min(18vw, 160px)',
        },
        {
          id: 'mum',
          src: assets.characters.family.mum,
          right: '4%',
          bottom: '6%',
          width: 'min(18vw, 160px)',
        },
      ],
      hotspots: [
        {
          id: 'packet',
          kind: 'label_bounce',
          x: 30,
          y: 22,
          size: 130,
          asset: p.redPacket,
          label: { yue: '利是', pu: '红包' },
        },
        {
          id: 'tangerine',
          kind: 'label_bounce',
          x: 58,
          y: 22,
          size: 130,
          asset: p.tangerine,
          label: { yue: '年桔', pu: '年桔' },
        },
      ],
      autoAdvance: true,
    },
  ],
};
