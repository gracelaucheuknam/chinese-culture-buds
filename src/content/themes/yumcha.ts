import type { ChoiceConfig } from '../../activities/ChoiceGame';
import type { PuzzleConfig } from '../../activities/PuzzleGame';
import { assets } from '../assets';
import type { Theme } from './types';

const p = assets.yumcha.props;
const opt = (id: string, yue: string, pu: string, img: string) => ({ id, label: { yue, pu }, img });

const harGow = opt('hargow', '蝦餃', '虾饺', p.harGow);
const siuMai = opt('siumai', '燒賣', '烧卖', p.siuMai);
const bao = opt('bao', '叉燒包', '叉烧包', p.charSiuBao);
const eggTart = opt('tart', '蛋撻', '蛋挞', p.eggTart);
const cheungFun = opt('cheungfun', '腸粉', '肠粉', p.cheungFun);

const orderConfig: ChoiceConfig = {
  themeId: 'yumcha',
  guide: 'baobao',
  title: { yue: '點點心', pu: '点点心' },
  doneLine: 'yc_order_done',
  rounds: [
    { promptLine: 'yc_order_1', answer: 'hargow', options: [siuMai, harGow, eggTart] },
    { promptLine: 'yc_order_2', answer: 'siumai', options: [bao, cheungFun, siuMai] },
    { promptLine: 'yc_order_3', answer: 'bao', options: [bao, harGow, eggTart] },
  ],
};

const puzzleConfig: PuzzleConfig = {
  themeId: 'yumcha',
  guide: 'baobao',
  title: '點心拼圖',
  images: [assets.yumcha.puzzle.puzzle1, assets.yumcha.puzzle.puzzle2],
  lines: {
    intro: 'yc_puzzle_intro',
    good: 'yc_puzzle_good',
    retry: 'yc_puzzle_retry',
    next: 'yc_puzzle_next',
    idle: 'yc_idle',
  },
};

export const yumcha: Theme = {
  id: 'yumcha',
  status: 'ready',
  title: { yue: '飲茶', pu: '饮茶' },
  guide: 'baobao',
  outfit: 'daily',
  mapPin: 'yumcha',
  sticker: { id: 'yumcha', name: { yue: '飲茶小達人', pu: '饮茶小达人' } },
  bg: assets.yumcha.story.bgTeahouse,
  welcomeLine: 'yc_welcome',
  completeLine: 'yc_complete',
  activities: [
    { id: 'yc_story', type: 'story', title: { yue: '一齊去飲茶', pu: '一起去饮茶' } },
    {
      id: 'yc_order',
      type: 'choice',
      title: { yue: '點點心', pu: '点点心' },
      icon: p.harGow,
      config: orderConfig,
    },
    {
      id: 'yc_puzzle',
      type: 'puzzle',
      title: { yue: '點心拼圖', pu: '点心拼图' },
      icon: p.siuMai,
      config: puzzleConfig,
    },
  ],
};
