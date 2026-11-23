/** Central catalogue of sliced WebP art. Components must import paths from here. */

import type { Gender, HeadId, OutfitId } from './types';

/** Respect Vite `base` so GitHub Pages project URLs resolve correctly. */
const w = (...parts: string[]) => `${import.meta.env.BASE_URL}assets/${parts.join('/')}.webp`;

export const assets = {
  characters: {
    dongdong: {
      stand: w('characters', 'dongdong_stand'),
      wave: w('characters', 'dongdong_wave'),
      clap: w('characters', 'dongdong_clap'),
      tilt: w('characters', 'dongdong_tilt'),
    },
    puff: {
      stand: w('characters', 'puff_stand'),
      wave: w('characters', 'puff_wave'),
      clap: w('characters', 'puff_clap'),
      tilt: w('characters', 'puff_tilt'),
    },
    /** 醒獅仔彩彩 — 農曆新年 guide (Firefly). */
    caicai: {
      stand: w('characters', 'caicai_stand'),
      wave: w('characters', 'caicai_wave'),
      clap: w('characters', 'caicai_clap'),
      tilt: w('characters', 'caicai_tilt'),
    },
    /** 叉燒包包包 — 飲茶 guide (Firefly). */
    baobao: {
      stand: w('characters', 'baobao_stand'),
      wave: w('characters', 'baobao_wave'),
      clap: w('characters', 'baobao_clap'),
      tilt: w('characters', 'baobao_tilt'),
    },
    houyi: {
      stand: w('characters', 'houyi_stand'),
      pose: w('characters', 'houyi_pose'),
      wave: w('characters', 'houyi_wave'),
    },
    change: {
      stand: w('characters', 'change_stand'),
      wave: w('characters', 'change_wave'),
      float: w('characters', 'change_float'),
    },
    quyuan: {
      stand: w('characters', 'quyuan_stand'),
      wave: w('characters', 'quyuan_wave'),
      read: w('characters', 'quyuan_read'),
    },
    family: {
      grandpa: w('characters', 'family_grandpa'),
      grandma: w('characters', 'family_grandma'),
      dad: w('characters', 'family_dad'),
      mum: w('characters', 'family_mum'),
    },
    villagers: {
      man_worried: w('characters', 'villager_man_worried'),
      woman_worried: w('characters', 'villager_woman_worried'),
      girl_worried: w('characters', 'villager_girl_worried'),
      man_cheer: w('characters', 'villager_man_cheer'),
      woman_cheer: w('characters', 'villager_woman_cheer'),
      girl_cheer: w('characters', 'villager_girl_cheer'),
    },
  },
  avatar: {
    head: {
      rat: w('avatar/head', 'rat'),
      ox: w('avatar/head', 'ox'),
      tiger: w('avatar/head', 'tiger'),
      rabbit: w('avatar/head', 'rabbit'),
      dragon: w('avatar/head', 'dragon'),
      snake: w('avatar/head', 'snake'),
      horse: w('avatar/head', 'horse'),
      goat: w('avatar/head', 'goat'),
      monkey: w('avatar/head', 'monkey'),
      rooster: w('avatar/head', 'rooster'),
      dog: w('avatar/head', 'dog'),
      pig: w('avatar/head', 'pig'),
      panda: w('avatar/head', 'panda'),
    } satisfies Record<HeadId, string>,
    body: (outfit: OutfitId, gender: Gender) => w('avatar/body', `${outfit}_${gender}`),
    outfit: (outfit: OutfitId, gender: Gender) => w('avatar/outfit', `${outfit}_${gender}`),
    bow: w('avatar/accessory', 'bow'),
  },
  ui: {
    button: w('ui', 'button'),
    buttonPressed: w('ui', 'button_pressed'),
    iconBack: w('ui', 'icon_back'),
    iconSound: w('ui', 'icon_sound'),
    iconPause: w('ui', 'icon_pause'),
    iconPlay: w('ui', 'icon_play'),
    iconHome: w('ui', 'icon_home'),
    iconStar: w('ui', 'icon_star'),
    panel: w('ui', 'panel'),
    card: w('ui', 'card'),
    bubble: w('ui', 'bubble'),
    medal: w('ui', 'medal'),
    progressLanterns: w('ui', 'progress_lanterns'),
  },
  map: {
    bg: w('map', 'map_bg'),
  },
  /** Full-screen backgrounds for each step of the flow. */
  screens: {
    cover: w('screens', 'bg_cover'),
    avatar: w('screens', 'bg_avatar'),
    stickers: w('screens', 'bg_stickers'),
    parents: w('screens', 'bg_parents'),
  },
  midautumn: {
    story: {
      bgHot: w('midautumn/story', 'bg_hot'),
      bgCool: w('midautumn/story', 'bg_cool'),
      bgMoon: w('midautumn/story', 'bg_moon'),
      bgCourtyard: w('midautumn/story', 'bg_courtyard'),
    },
    props: {
      sunHot: w('midautumn/props', 'sun_hot'),
      sunYawn: w('midautumn/props', 'sun_yawn'),
      sunSleep: w('midautumn/props', 'sun_sleep'),
      starOff: w('midautumn/props', 'star_off'),
      starOn: w('midautumn/props', 'star_on'),
      mooncake: w('midautumn/props', 'mooncake'),
      lantern: w('midautumn/props', 'lantern'),
      pomelo: w('midautumn/props', 'pomelo'),
      osmanthus: w('midautumn/props', 'osmanthus'),
    },
    lantern: {
      shapeRound: w('midautumn/lantern', 'shape_round'),
      shapeRabbit: w('midautumn/lantern', 'shape_rabbit'),
      shapeStar: w('midautumn/lantern', 'shape_star'),
      stickerRabbit: w('midautumn/lantern', 'sticker_rabbit'),
      stickerMooncake: w('midautumn/lantern', 'sticker_mooncake'),
      stickerPomelo: w('midautumn/lantern', 'sticker_pomelo'),
      stickerStar: w('midautumn/lantern', 'sticker_star'),
      stickerMoon: w('midautumn/lantern', 'sticker_moon'),
      stickerOsmanthus: w('midautumn/lantern', 'sticker_osmanthus'),
    },
    puzzle: {
      puzzle1: w('midautumn/puzzle', 'puzzle_1'),
      puzzle2: w('midautumn/puzzle', 'puzzle_2'),
    },
  },
  dragonboat: {
    story: {
      bgVillage: w('dragonboat/story', 'bg_village'),
      bgRiver: w('dragonboat/story', 'bg_river'),
      bgFestival: w('dragonboat/story', 'bg_festival'),
    },
    props: {
      boat: w('dragonboat/props', 'boat'),
      drum: w('dragonboat/props', 'drum'),
      drumLit: w('dragonboat/props', 'drum_lit'),
      zongzi: w('dragonboat/props', 'zongzi'),
      fishOrange: w('dragonboat/props', 'fish_orange'),
      fishBlue: w('dragonboat/props', 'fish_blue'),
      sachet: w('dragonboat/props', 'sachet'),
    },
    zongzi: {
      leaf: w('dragonboat/zongzi', 'leaf'),
      rice: w('dragonboat/zongzi', 'rice'),
      fillingYolk: w('dragonboat/zongzi', 'filling_yolk'),
      fillingRedbean: w('dragonboat/zongzi', 'filling_redbean'),
      fillingMungbean: w('dragonboat/zongzi', 'filling_mungbean'),
      string: w('dragonboat/zongzi', 'string'),
      bowl: w('dragonboat/zongzi', 'bowl'),
      stepRice: w('dragonboat/zongzi', 'step_rice'),
      zongziDone: w('dragonboat/zongzi', 'zongzi_done'),
      steamer: w('dragonboat/zongzi', 'steamer'),
      zongziCooked: w('dragonboat/zongzi', 'zongzi_cooked'),
    },
    race: {
      riverBg: w('dragonboat/race', 'river_bg'),
      boatCrew: w('dragonboat/race', 'boat_crew'),
    },
  },
  /** 農曆新年 — art to be made in Firefly (see design/firefly-prompts.md). */
  newyear: {
    story: {
      bgVillageNight: w('newyear/story', 'bg_village_night'),
      bgDoor: w('newyear/story', 'bg_door'),
      bgHome: w('newyear/story', 'bg_home'),
    },
    props: {
      nian: w('newyear/props', 'nian_beast'),
      firecracker: w('newyear/props', 'firecracker'),
      faiChun: w('newyear/props', 'fai_chun'),
      lanternRed: w('newyear/props', 'lantern_red'),
      redPacket: w('newyear/props', 'red_packet'),
      nianGou: w('newyear/props', 'nian_gou'),
      tangerine: w('newyear/props', 'tangerine'),
      mooncake: w('midautumn/props', 'mooncake'),
      zongzi: w('dragonboat/props', 'zongzi'),
    },
    puzzle: {
      puzzle1: w('newyear/puzzle', 'puzzle_1'),
      puzzle2: w('newyear/puzzle', 'puzzle_2'),
    },
  },
  /** 飲茶 — art to be made in Firefly (see design/firefly-prompts.md). */
  yumcha: {
    story: {
      bgStreet: w('yumcha/story', 'bg_street'),
      bgTeahouse: w('yumcha/story', 'bg_teahouse'),
    },
    props: {
      teapot: w('yumcha/props', 'teapot'),
      teacup: w('yumcha/props', 'teacup'),
      harGow: w('yumcha/props', 'har_gow'),
      siuMai: w('yumcha/props', 'siu_mai'),
      charSiuBao: w('yumcha/props', 'char_siu_bao'),
      eggTart: w('yumcha/props', 'egg_tart'),
      cheungFun: w('yumcha/props', 'cheung_fun'),
    },
    puzzle: {
      puzzle1: w('yumcha/puzzle', 'puzzle_1'),
      puzzle2: w('yumcha/puzzle', 'puzzle_2'),
    },
  },
} as const;

export type GuideCharacterId =
  | 'puff'
  | 'dongdong'
  | 'caicai'
  | 'baobao'
  | 'houyi'
  | 'change'
  | 'quyuan';

/** The four festival guides (each festival has its own). */
export type FestivalGuideId = 'puff' | 'dongdong' | 'caicai' | 'baobao';

export const guideInfo: Record<FestivalGuideId, { name: string; full: string; fallback: 'puff' | 'dongdong' }> = {
  puff: { name: '胖胖', full: '小玉兔胖胖', fallback: 'puff' },
  dongdong: { name: '咚咚', full: '小龍仔咚咚', fallback: 'dongdong' },
  caicai: { name: '彩彩', full: '醒獅仔彩彩', fallback: 'puff' },
  baobao: { name: '包包', full: '叉燒包包包', fallback: 'dongdong' },
};

export type GuidePoseId = 'idle' | 'talk' | 'welcome' | 'cheer' | 'hint' | 'tilt';

/** Map logical pose → image URL for each guide / story character. */
export function guidePoseSrc(id: GuideCharacterId, pose: GuidePoseId = 'idle'): string {
  switch (id) {
    case 'puff':
    case 'dongdong':
    case 'caicai':
    case 'baobao': {
      const set = assets.characters[id];
      if (pose === 'welcome') return set.wave;
      if (pose === 'cheer') return set.clap;
      if (pose === 'hint' || pose === 'tilt') return set.tilt;
      return set.stand; // idle, talk
    }
    case 'houyi': {
      const set = assets.characters.houyi;
      if (pose === 'welcome') return set.wave;
      if (pose === 'cheer') return set.pose;
      if (pose === 'hint' || pose === 'tilt') return set.pose;
      return set.stand;
    }
    case 'change': {
      const set = assets.characters.change;
      if (pose === 'welcome') return set.wave;
      if (pose === 'cheer' || pose === 'hint' || pose === 'tilt') return set.float;
      return set.stand;
    }
    case 'quyuan': {
      const set = assets.characters.quyuan;
      if (pose === 'welcome' || pose === 'cheer') return set.wave;
      if (pose === 'hint' || pose === 'tilt') return set.read;
      return set.stand;
    }
    default:
      return assets.characters.puff.stand;
  }
}

export function avatarHeadSrc(head: HeadId): string {
  return assets.avatar.head[head];
}

export type ZodiacPose = 'idle' | 'wave' | 'cheer';

/** Standalone full zodiac character, one picture per animal and pose (made in Firefly). */
export function zodiacSrc(head: HeadId, pose: ZodiacPose = 'idle'): string {
  return w('avatar/zodiac', pose === 'idle' ? head : `${head}_${pose}`);
}

export function avatarBodySrc(outfit: OutfitId, gender: Gender): string {
  return assets.avatar.body(outfit, gender);
}

/** Activity card icons on ThemeHome (no emoji). */
export const activityIconSrc: Record<string, string> = {
  story: assets.ui.iconPlay,
  lantern: assets.midautumn.lantern.shapeRound,
  puzzle: assets.ui.iconStar,
  zongzi: assets.dragonboat.zongzi.zongziDone,
  race: assets.dragonboat.props.boat,
};
