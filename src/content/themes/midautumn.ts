import { assets } from '../assets';
import type { Theme } from './types';

export const midautumn: Theme = {
  id: 'midautumn',
  status: 'ready',
  title: { yue: '中秋節', pu: '中秋节' },
  guide: 'puff',
  outfit: 'midautumn',
  mapPin: 'midautumn',
  sticker: { id: 'midautumn', name: { yue: '中秋小達人', pu: '中秋小达人' } },
  bg: assets.midautumn.story.bgCourtyard,
  welcomeLine: 'ma_welcome',
  completeLine: 'ma_complete',
  activities: [
    {
      id: 'ma_story',
      type: 'story',
      title: { yue: '月亮上的祕密', pu: '月亮上的秘密' },
    },
    {
      id: 'ma_lantern',
      type: 'lantern',
      title: { yue: '我的閃亮燈籠', pu: '我的闪亮灯笼' },
    },
    {
      id: 'ma_puzzle',
      type: 'puzzle',
      title: { yue: '中秋團圓小拼圖', pu: '中秋团圆小拼图' },
    },
  ],
};
