import type { Line } from '../types';

export const avatarLines: Line[] = [
  {
    id: 'avatar_name',
    yue: '請家長幫小朋友輸入名字啦！',
    pu: '请家长帮小朋友输入名字喔！',
  },
  {
    id: 'avatar_head',
    yue: '你屬乜嘢呀？撳一隻啦！',
    pu: '你属什么呀？点一只吧！',
  },
  {
    id: 'avatar_gender',
    yue: '你係小男孩定小女孩呀？',
    pu: '你是小男孩还是小女孩呀？',
  },
  {
    id: 'avatar_done',
    yue: '{name}，我哋出發啦！',
    pu: '{name}，我们出发啦！',
    audioText: {
      yue: '我哋出發啦！',
      pu: '我们出发啦！',
    },
  },
  {
    id: 'start_welcome_back',
    yue: '歡迎返嚟，{name}！',
    pu: '欢迎回来，{name}！',
    audioText: {
      yue: '歡迎返嚟！',
      pu: '欢迎回来！',
    },
  },
];
