import { Howl, Howler } from 'howler';
import { audioPath } from './assets';
import { getLine, resolveAudioText, resolveLineText } from '../content/lines';
import type { Lang } from '../content/types';

const BGM_VOLUME = 0.3;
const SFX_VOLUME = 0.8;
const VOICE_VOLUME = 1;

type AudioSettings = {
  sound: boolean;
  bgm: boolean;
  lang: Lang;
};

let settings: AudioSettings = {
  sound: true,
  bgm: true,
  lang: 'yue',
};

let unlocked = false;
let currentVoice: Howl | null = null;
let bgmHowl: Howl | null = null;
let subtitleListener: ((text: string | null) => void) | null = null;
let currentSubtitle: string | null = null;

const missingAudioCache = new Set<string>();
const synthCtxRef: { current: AudioContext | null } = { current: null };

export function setAudioSettings(next: Partial<AudioSettings>): void {
  settings = { ...settings, ...next };
  if (!settings.sound || !settings.bgm) {
    bgmHowl?.pause();
  } else if (unlocked && bgmHowl) {
    bgmHowl.play();
  }
  if (!settings.sound) {
    stopVoice();
  }
}

export function onSubtitle(listener: (text: string | null) => void): () => void {
  subtitleListener = listener;
  // Sync current line so late-mounted Subtitle still shows welcome text
  listener(currentSubtitle);
  return () => {
    if (subtitleListener === listener) subtitleListener = null;
  };
}

function emitSubtitle(text: string | null): void {
  currentSubtitle = text;
  subtitleListener?.(text);
}

export function clearSubtitle(): void {
  emitSubtitle(null);
}

export function getCurrentSubtitle(): string | null {
  return currentSubtitle;
}

/** First user gesture unlocks audio on iOS Safari. */
export async function unlockAudio(): Promise<void> {
  if (unlocked) return;
  unlocked = true;

  try {
    Howler.ctx?.resume?.();
  } catch {
    /* ignore */
  }

  try {
    const silent = new Howl({
      src: [
        'data:audio/mp3;base64,//uQxAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAACcQCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA//////////////////////////////////////////////////////////////////8AAAA8TEFNRTMuMTAwAc0AAAAAAAAAABSAJAJAQgAAgAAAAHEghVrGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      ],
      volume: 0.01,
    });
    silent.play();
    silent.once('end', () => silent.unload());
  } catch {
    /* ignore */
  }

  ensureSynth();
}

export function isAudioUnlocked(): boolean {
  return unlocked;
}

function ensureSynth(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!synthCtxRef.current) {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return null;
    synthCtxRef.current = new Ctx();
  }
  void synthCtxRef.current.resume();
  return synthCtxRef.current;
}

/** Placeholder SFX via Web Audio when mp3 files are missing. */
function playSynthSfx(id: string): void {
  const ctx = ensureSynth();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  gain.gain.value = SFX_VOLUME * 0.25;

  switch (id) {
    case 'tap':
      osc.type = 'sine';
      osc.frequency.setValueAtTime(660, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.12);
      break;
    case 'snap':
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
      break;
    case 'success':
    case 'cheer':
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523, now);
      osc.frequency.setValueAtTime(659, now + 0.1);
      osc.frequency.setValueAtTime(784, now + 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc.start(now);
      osc.stop(now + 0.45);
      break;
    case 'drum':
      osc.type = 'square';
      osc.frequency.setValueAtTime(120, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
      break;
    default:
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
  }
}

let ttsToken = 0;

/** Rough time a K1 child needs to hear / see a line, used when TTS is unavailable or silent. */
function readingMs(text: string): number {
  return Math.min(7000, 1500 + text.length * 170);
}

function pickVoice(lang: Lang): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices();
  return lang === 'yue'
    ? voices.find((v) => /zh[-_]HK|yue|Cantonese/i.test(`${v.lang} ${v.name}`))
    : voices.find((v) => /zh[-_]CN|Chinese/i.test(`${v.lang} ${v.name}`));
}

/**
 * Speak with the browser voice. Always resolves:
 * - never earlier than the reading time (so stories don't flip pages when no Cantonese voice exists)
 * - never later than a safety timeout (iOS sometimes never fires `onend`)
 * Only the newest utterance may clear the subtitle (a cancelled one must not wipe the next line).
 */
function speakTts(text: string, lang: Lang): Promise<void> {
  const token = ++ttsToken;
  const minMs = readingMs(text);
  const started = Date.now();

  const finish = (resolve: () => void) => {
    const wait = Math.max(0, minMs - (Date.now() - started));
    window.setTimeout(() => {
      if (token === ttsToken) emitSubtitle(null);
      resolve();
    }, wait);
  };

  if (typeof window === 'undefined' || !window.speechSynthesis) {
    return new Promise((resolve) => finish(resolve));
  }

  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = lang === 'yue' ? 'zh-HK' : 'zh-CN';
  utter.rate = 0.9;
  const prefer = pickVoice(lang);
  if (prefer) utter.voice = prefer;

  return new Promise((resolve) => {
    let done = false;
    const end = () => {
      if (done) return;
      done = true;
      window.clearTimeout(safety);
      finish(resolve);
    };
    const safety = window.setTimeout(end, minMs + 6000);
    utter.onend = end;
    utter.onerror = end;
    try {
      window.speechSynthesis.speak(utter);
    } catch {
      end();
    }
  });
}

/** Speak arbitrary text (e.g. avatar animal intros) with subtitle. */
export function speakText(text: string, lang?: Lang): Promise<void> {
  const useLang = lang ?? settings.lang;
  emitSubtitle(text);
  if (!settings.sound) {
    const token = ++ttsToken;
    return new Promise((resolve) => {
      window.setTimeout(() => {
        if (token === ttsToken) emitSubtitle(null);
        resolve();
      }, readingMs(text));
    });
  }
  void unlockAudio();
  stopVoice();
  return speakTts(text, useLang);
}

function stopVoice(): void {
  ttsToken += 1;
  currentVoice?.stop();
  currentVoice?.unload();
  currentVoice = null;
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

export function playLine(lineId: string, vars: Record<string, string> = {}): Promise<void> {
  const lang = settings.lang;
  const display = resolveLineText(lineId, lang, vars);
  if (!display) {
    console.warn(`[audio] unknown line: ${lineId}`);
    return Promise.resolve();
  }

  emitSubtitle(display);
  if (!settings.sound) {
    const token = ++ttsToken;
    return new Promise((resolve) => {
      window.setTimeout(() => {
        if (token === ttsToken) emitSubtitle(null);
        resolve();
      }, readingMs(display));
    });
  }

  void unlockAudio();
  stopVoice();

  const hasName = Boolean(vars.name) && (getLine(lineId)?.[lang].includes('{name') ?? false);
  // Pre-recorded files don't include the child's name — use TTS when name is inserted.
  if (hasName) {
    return speakTts(display, lang);
  }

  const src = audioPath(lang, `${lineId}.mp3`);
  if (missingAudioCache.has(src)) {
    return speakTts(resolveAudioText(lineId, lang) ?? display, lang);
  }

  return new Promise((resolve) => {
    const howl = new Howl({
      src: [src],
      volume: VOICE_VOLUME,
      html5: true,
    });
    currentVoice = howl;

    const finish = () => {
      emitSubtitle(null);
      howl.unload();
      if (currentVoice === howl) currentVoice = null;
      resolve();
    };

    howl.once('loaderror', () => {
      howl.unload();
      if (currentVoice === howl) currentVoice = null;
      missingAudioCache.add(src);
      void speakTts(resolveAudioText(lineId, lang) ?? display, lang).then(resolve);
    });

    howl.once('end', finish);
    howl.play();
  });
}

export function pauseVoice(): void {
  currentVoice?.pause();
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.pause();
  }
}

export function resumeVoice(): void {
  currentVoice?.play();
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.resume();
  }
}

export function stopNarration(): void {
  stopVoice();
  emitSubtitle(null);
}

export function playSfx(id: string): void {
  if (!settings.sound) return;
  void unlockAudio();

  const src = audioPath('sfx', `${id}.mp3`);
  if (missingAudioCache.has(src)) {
    playSynthSfx(id);
    return;
  }

  const howl = new Howl({
    src: [src],
    volume: SFX_VOLUME,
  });

  howl.once('loaderror', () => {
    missingAudioCache.add(src);
    howl.unload();
    playSynthSfx(id);
  });

  howl.once('end', () => howl.unload());
  howl.play();
}

export function playBgm(trackId = 'main'): void {
  if (!settings.sound || !settings.bgm) return;
  void unlockAudio();

  const src = audioPath('bgm', `${trackId}.mp3`);
  if (missingAudioCache.has(src)) return;

  if (bgmHowl) {
    bgmHowl.stop();
    bgmHowl.unload();
    bgmHowl = null;
  }

  const howl = new Howl({
    src: [src],
    volume: BGM_VOLUME,
    loop: true,
  });
  bgmHowl = howl;

  howl.once('loaderror', () => {
    missingAudioCache.add(src);
    howl.unload();
    if (bgmHowl === howl) bgmHowl = null;
  });

  howl.play();
}

export function stopBgm(): void {
  bgmHowl?.stop();
}
