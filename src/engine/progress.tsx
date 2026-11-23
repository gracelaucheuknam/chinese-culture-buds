import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type Dispatch,
  type ReactNode,
} from 'react';
import { appConfig } from '../config/app';
import type { Gender, HeadId, Lang } from '../content/types';
import { setAudioSettings } from './audio';

const STORAGE_KEY = 'tsl_progress_v1';
const STORAGE_VERSION = 1;

export type PlayerProfile = {
  name: string;
  head: HeadId;
  gender: Gender;
  lang: Lang;
};

export type AppSettings = {
  subtitles: boolean;
  sound: boolean;
  bgm: boolean;
  whiteboardMode: boolean;
};

export type ProgressState = {
  version: number;
  profile: PlayerProfile | null;
  completed: Record<string, true>;
  stickers: Record<string, true>;
  settings: AppSettings;
  surveyUnlocked: boolean;
};

type Action =
  | { type: 'SET_PROFILE'; profile: PlayerProfile }
  | { type: 'UPDATE_PROFILE'; patch: Partial<PlayerProfile> }
  | { type: 'COMPLETE_ACTIVITY'; activityId: string }
  | { type: 'UNLOCK_STICKER'; themeId: string }
  | { type: 'UPDATE_SETTINGS'; patch: Partial<AppSettings> }
  | { type: 'SET_SURVEY_UNLOCKED'; value: boolean }
  | { type: 'RESET' }
  | { type: 'HYDRATE'; state: ProgressState };

export const defaultSettings: AppSettings = {
  subtitles: true,
  sound: true,
  bgm: true,
  whiteboardMode: false,
};

export function createInitialState(): ProgressState {
  return {
    version: STORAGE_VERSION,
    profile: null,
    completed: {},
    stickers: {},
    settings: { ...defaultSettings },
    surveyUnlocked: false,
  };
}

function progressReducer(state: ProgressState, action: Action): ProgressState {
  switch (action.type) {
    case 'HYDRATE':
      return action.state;
    case 'SET_PROFILE':
      return { ...state, profile: action.profile };
    case 'UPDATE_PROFILE':
      if (!state.profile) {
        return {
          ...state,
          profile: {
            name: action.patch.name ?? '小朋友',
            head: action.patch.head ?? 'rabbit',
            gender: action.patch.gender ?? 'girl',
            lang: action.patch.lang ?? appConfig.defaultLang,
          },
        };
      }
      return { ...state, profile: { ...state.profile, ...action.patch } };
    case 'COMPLETE_ACTIVITY':
      return {
        ...state,
        completed: { ...state.completed, [action.activityId]: true },
      };
    case 'UNLOCK_STICKER':
      return {
        ...state,
        stickers: { ...state.stickers, [action.themeId]: true },
      };
    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.patch },
      };
    case 'SET_SURVEY_UNLOCKED':
      return { ...state, surveyUnlocked: action.value };
    case 'RESET':
      return createInitialState();
    default:
      return state;
  }
}

function loadFromStorage(): ProgressState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ProgressState;
    if (!parsed || typeof parsed !== 'object') return null;
    return {
      ...createInitialState(),
      ...parsed,
      settings: { ...defaultSettings, ...parsed.settings },
      completed: parsed.completed ?? {},
      stickers: parsed.stickers ?? {},
      version: STORAGE_VERSION,
    };
  } catch {
    return null;
  }
}

function saveToStorage(state: ProgressState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* private browsing / quota — app must still work */
  }
}

type ProgressContextValue = {
  state: ProgressState;
  dispatch: Dispatch<Action>;
};

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(
    progressReducer,
    undefined,
    () => loadFromStorage() ?? createInitialState(),
  );

  useEffect(() => {
    saveToStorage(state);
  }, [state]);

  useEffect(() => {
    const lang = state.profile?.lang ?? appConfig.defaultLang;
    setAudioSettings({
      sound: state.settings.sound,
      bgm: state.settings.bgm,
      lang,
    });
  }, [state.profile?.lang, state.settings.sound, state.settings.bgm]);

  const value = useMemo(() => ({ state, dispatch }), [state]);

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext);
  if (!ctx) {
    throw new Error('useProgress must be used within ProgressProvider');
  }
  return ctx;
}
