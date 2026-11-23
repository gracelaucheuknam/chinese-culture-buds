/** App-level settings — edit here when team confirms URLs / copy. */

export const appConfig = {
  title: '童心樂中華',
  defaultLang: 'yue' as const,
  /** Google Form URL for parent survey — replace before Beta. */
  surveyUrl: 'https://forms.google.com/TODO',
  acknowledgements: {
    yue: '本項目獲 APSS 資助。鳴謝文字【待團隊確認】。',
    pu: '本项目获 APSS 资助。鸣谢文字【待团队确认】。',
  },
  usageTips: {
    yue: '建議每次玩 10–15 分鐘，家長陪同效果更佳。',
    pu: '建议每次玩 10–15 分钟，家长陪同效果更佳。',
  },
  classroomTips: {
    yue: '課堂可用電子白板帶全班互動（一齊點動畫、票選最靚燈籠）。開啟「電子白板模式」後，按鈕同字幕會放大 1.25 倍。',
    pu: '课堂可用电子白板带全班互动（一起点动画、票选最漂亮的灯笼）。开启「电子白板模式」后，按钮和字幕会放大 1.25 倍。',
  },
  paidComingSoon: {
    yue: '付費解鎖功能敬請期待。',
    pu: '付费解锁功能敬请期待。',
  },
} as const;
