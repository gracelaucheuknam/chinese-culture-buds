import type { Gender, HeadId, LocalizedText, OutfitId } from './types';

export type AvatarHeadOption = {
  id: HeadId;
  name: LocalizedText;
  intro: LocalizedText;
};

/** Head overlay anchors as percentages of the body image box. */
export type AvatarHeadAnchor = {
  headCenterX: number;
  headCenterY: number;
  headWidth: number;
  neckYRatio: number;
};

export const avatarHeadAnchors: Record<`${OutfitId}_${Gender}`, AvatarHeadAnchor> = {
  daily_boy: {
    headCenterX: 0.4977,
    headCenterY: 0.02,
    headWidth: 0.7,
    neckYRatio: 0.4788,
  },
  midautumn_boy: {
    headCenterX: 0.5686,
    headCenterY: 0.02,
    headWidth: 0.7,
    neckYRatio: 0.4772,
  },
  dragonboat_boy: {
    headCenterX: 0.5512,
    headCenterY: 0.02,
    headWidth: 0.7,
    neckYRatio: 0.4802,
  },
  daily_girl: {
    headCenterX: 0.4953,
    headCenterY: 0.02,
    headWidth: 0.7,
    neckYRatio: 0.4768,
  },
  midautumn_girl: {
    headCenterX: 0.5709,
    headCenterY: 0.02,
    headWidth: 0.7,
    neckYRatio: 0.4768,
  },
  dragonboat_girl: {
    headCenterX: 0.5512,
    headCenterY: 0.02,
    headWidth: 0.7,
    neckYRatio: 0.4799,
  },
};

export function getAvatarAnchor(outfit: OutfitId, gender: Gender): AvatarHeadAnchor {
  return avatarHeadAnchors[`${outfit}_${gender}`];
}

export const avatarHeads: AvatarHeadOption[] = [
  {
    id: 'rat',
    name: { yue: '小老鼠', pu: '小老鼠' },
    intro: { yue: '我係小老鼠！', pu: '我是小老鼠！' },
  },
  {
    id: 'ox',
    name: { yue: '小牛牛', pu: '小牛牛' },
    intro: { yue: '我係小牛牛！', pu: '我是小牛牛！' },
  },
  {
    id: 'tiger',
    name: { yue: '小老虎', pu: '小老虎' },
    intro: { yue: '我係小老虎！', pu: '我是小老虎！' },
  },
  {
    id: 'rabbit',
    name: { yue: '小兔子', pu: '小兔子' },
    intro: { yue: '我係小兔子！', pu: '我是小兔子！' },
  },
  {
    id: 'dragon',
    name: { yue: '小龍仔', pu: '小龙仔' },
    intro: { yue: '我係小龍仔！', pu: '我是小龙仔！' },
  },
  {
    id: 'snake',
    name: { yue: '小蛇蛇', pu: '小蛇蛇' },
    intro: { yue: '我係小蛇蛇！', pu: '我是小蛇蛇！' },
  },
  {
    id: 'horse',
    name: { yue: '小馬兒', pu: '小马儿' },
    intro: { yue: '我係小馬兒！', pu: '我是小马儿！' },
  },
  {
    id: 'goat',
    name: { yue: '小羊羊', pu: '小羊羊' },
    intro: { yue: '我係小羊羊！', pu: '我是小羊羊！' },
  },
  {
    id: 'monkey',
    name: { yue: '小猴子', pu: '小猴子' },
    intro: { yue: '我係小猴子！', pu: '我是小猴子！' },
  },
  {
    id: 'rooster',
    name: { yue: '小公雞', pu: '小公鸡' },
    intro: { yue: '我係小公雞！', pu: '我是小公鸡！' },
  },
  {
    id: 'dog',
    name: { yue: '小狗狗', pu: '小狗狗' },
    intro: { yue: '我係小狗狗！', pu: '我是小狗狗！' },
  },
  {
    id: 'pig',
    name: { yue: '小豬豬', pu: '小猪猪' },
    intro: { yue: '我係小豬豬！', pu: '我是小猪猪！' },
  },
];

export function getHeadOption(id: HeadId): AvatarHeadOption {
  return avatarHeads.find((h) => h.id === id) ?? avatarHeads[3];
}
