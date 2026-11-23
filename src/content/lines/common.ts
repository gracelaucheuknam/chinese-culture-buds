import type { Line } from '../types';

export const commonLines: Line[] = [
  {
    id: 'common_hello',
    yue: '哈囉{name}！歡迎嚟到童心樂中華！',
    pu: '哈囉{name}！欢迎来到童心乐中华！',
    audioText: {
      yue: '哈囉！歡迎嚟到童心樂中華！',
      pu: '哈囉！欢迎来到童心乐中华！',
    },
  },
  {
    id: 'common_coming_soon',
    yue: '呢個地方仲整緊，好快就會開放㗎！',
    pu: '这个地方还在准备中，很快就会开放喔！',
  },
  {
    id: 'common_idle',
    yue: '唔使驚，撳一下試吓啦！',
    pu: '不用怕，点一下试试看！',
  },
  {
    id: 'common_good',
    yue: '好叻呀！',
    pu: '好厉害呀！',
  },
  {
    id: 'common_retry',
    yue: '差少少，再試吓啦！',
    pu: '差一点，再试试看！',
  },
];
