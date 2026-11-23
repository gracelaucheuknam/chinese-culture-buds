import { assets } from '../assets';
import type { Theme } from './types';

export const dragonboat: Theme = {
  id: 'dragonboat',
  status: 'ready',
  title: { yue: '端午節', pu: '端午节' },
  guide: 'dongdong',
  outfit: 'dragonboat',
  mapPin: 'dragonboat',
  sticker: { id: 'dragonboat', name: { yue: '端午小達人', pu: '端午小达人' } },
  bg: assets.dragonboat.story.bgFestival,
  welcomeLine: 'db_welcome',
  completeLine: 'db_complete',
  activities: [
    {
      id: 'db_story',
      type: 'story',
      title: { yue: '屈原爺爺與龍舟', pu: '屈原爷爷与龙舟' },
    },
    {
      id: 'db_zongzi',
      type: 'zongzi',
      title: { yue: '包糭子小廚師', pu: '包粽子小厨师' },
    },
    {
      id: 'db_race',
      type: 'race',
      title: { yue: '龍舟齊齊划', pu: '龙舟齐齐划' },
    },
  ],
};
