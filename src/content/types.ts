export type Lang = 'yue' | 'pu';

export type LocalizedText = {
  yue: string;
  pu: string;
};

export type Line = {
  id: string;
  yue: string;
  pu: string;
  /** Spoken text without {name} for pre-recorded audio files. */
  audioText?: LocalizedText;
};

export type HeadId =
  | 'rat'
  | 'ox'
  | 'tiger'
  | 'rabbit'
  | 'dragon'
  | 'snake'
  | 'horse'
  | 'goat'
  | 'monkey'
  | 'rooster'
  | 'dog'
  | 'pig'
  | 'panda';

export type Gender = 'boy' | 'girl';

export type OutfitId = 'daily' | 'midautumn' | 'dragonboat';
