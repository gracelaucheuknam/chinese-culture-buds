import type { ChoiceConfig } from '../../activities/ChoiceGame';
import type { PuzzleConfig } from '../../activities/PuzzleGame';
import { assets } from '../assets';
import type { Theme } from './types';

const p = assets.newyear.props;
const opt = (id: string, yue: string, pu: string, img: string) => ({ id, label: { yue, pu }, img });

const faiChun = opt('faichun', '揮春', '挥春', p.faiChun);
const lantern = opt('lantern', '紅燈籠', '红灯笼', p.lanternRed);
const redPacket = opt('packet', '利是', '红包', p.redPacket);
const nianGou = opt('niangou', '年糕', '年糕', p.nianGou);
const mooncake = opt('mooncake', '月餅', '月饼', p.mooncake);
const zongzi = opt('zongzi', '糭', '粽子', p.zongzi);
const tangerine = opt('tangerine', '年桔', '年桔', p.tangerine);

const findConfig: ChoiceConfig = {
  themeId: 'newyear',
  guide: 'caicai',
  title: { yue: '新年搵一搵', pu: '新年找一找' },
  doneLine: 'ny_find_done',
  rounds: [
    { promptLine: 'ny_find_1', answer: 'faichun', options: [lantern, faiChun, redPacket] },
    { promptLine: 'ny_find_2', answer: 'niangou', options: [mooncake, zongzi, nianGou] },
    { promptLine: 'ny_find_3', answer: 'packet', options: [redPacket, tangerine, faiChun] },
  ],
};

const puzzleConfig: PuzzleConfig = {
  themeId: 'newyear',
  guide: 'caicai',
  title: '新年拼圖',
  images: [assets.newyear.puzzle.puzzle1, assets.newyear.puzzle.puzzle2],
  lines: {
    intro: 'ny_puzzle_intro',
    good: 'ny_puzzle_good',
    retry: 'ny_puzzle_retry',
    next: 'ny_puzzle_next',
    idle: 'ny_idle',
  },
};

export const newyear: Theme = {
  id: 'newyear',
  status: 'ready',
  title: { yue: '農曆新年', pu: '农历新年' },
  guide: 'caicai',
  outfit: 'daily',
  mapPin: 'newyear',
  sticker: { id: 'newyear', name: { yue: '新年小達人', pu: '新年小达人' } },
  bg: assets.newyear.story.bgDoor,
  welcomeLine: 'ny_welcome',
  completeLine: 'ny_complete',
  activities: [
    { id: 'ny_story', type: 'story', title: { yue: '年獸嚟咗', pu: '年兽来了' } },
    {
      id: 'ny_find',
      type: 'choice',
      title: { yue: '新年搵一搵', pu: '新年找一找' },
      icon: p.redPacket,
      config: findConfig,
    },
    {
      id: 'ny_puzzle',
      type: 'puzzle',
      title: { yue: '新年拼圖', pu: '新年拼图' },
      icon: p.faiChun,
      config: puzzleConfig,
    },
  ],
};
