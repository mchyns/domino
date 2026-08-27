import { create } from 'zustand';
import {
  getOrCreateSessionId,
  getStoredNickname,
  saveNickname as persistNickname,
} from '../engine/roomManager';
import { soundFx } from '../engine/audio';

export type ThemeMode = 'light' | 'dark';

interface PlayerStoreState {
  userId: string;
  nickname: string;
  isMuted: boolean;
  theme: ThemeMode;
  setNickname: (name: string) => void;
  toggleMute: () => void;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
}

export function getInitialTheme(): ThemeMode {
  if (typeof localStorage !== 'undefined') {
    const stored = localStorage.getItem('domino_theme');
    if (stored === 'dark' || stored === 'light') {
      return stored;
    }
  }
  if (
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  ) {
    return 'dark';
  }
  return 'light';
}

const DARK_VARS: Record<string, string> = {
  '--bg-app': '#141613',
  '--bg-surface': '#1F221E',
  '--bg-surface-secondary': '#282B26',
  '--bg-surface-tertiary': '#333730',
  '--text-ink': '#F3F2EE',
  '--text-ink-secondary': '#A6A8A2',
  '--text-ink-muted': '#757871',
  '--border-color': '#353932',
  '--border-dark': '#4A5046',
  '--action-bg': '#F3F2EE',
  '--action-hover': '#E2E0D8',
  '--action-text': '#141613',
  '--accent-color': '#8C978C',
  '--tile-bg': '#F5F4EF',
  '--tile-border': '#B0AFA8',
  '--tile-highlight': '#FFFFFF',
  '--tile-groove': '#B8B7B0',
  '--tile-pip': '#1A1B17',
};

const LIGHT_VARS: Record<string, string> = {
  '--bg-app': '#F3F2EE',
  '--bg-surface': '#FFFFFF',
  '--bg-surface-secondary': '#EAE8E2',
  '--bg-surface-tertiary': '#DFDDD6',
  '--text-ink': '#191A18',
  '--text-ink-secondary': '#72736E',
  '--text-ink-muted': '#9E9F9A',
  '--border-color': '#D8D7D1',
  '--border-dark': '#B0AFA8',
  '--action-bg': '#242623',
  '--action-hover': '#343733',
  '--action-text': '#FFFFFF',
  '--accent-color': '#697369',
  '--tile-bg': '#FCFCFA',
  '--tile-border': '#D3D2CA',
  '--tile-highlight': '#FFFFFF',
  '--tile-groove': '#C8C7C0',
  '--tile-pip': '#191A18',
};

export function applyThemeClass(theme: ThemeMode) {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  const body = document.body;
  const vars = theme === 'dark' ? DARK_VARS : LIGHT_VARS;

  // Set all CSS custom properties
  for (const [key, value] of Object.entries(vars)) {
    root.style.setProperty(key, value);
  }

  // Toggle .dark class
  if (theme === 'dark') {
    root.classList.add('dark');
    body?.classList.add('dark');
  } else {
    root.classList.remove('dark');
    body?.classList.remove('dark');
  }

  // Direct style for extra reliability
  root.style.backgroundColor = vars['--bg-app'];
  root.style.color = vars['--text-ink'];
  root.style.colorScheme = theme;

  if (body) {
    body.style.backgroundColor = vars['--bg-app'];
    body.style.color = vars['--text-ink'];
  }
}

// Initial apply
const initTheme = getInitialTheme();
applyThemeClass(initTheme);

export const usePlayerStore = create<PlayerStoreState>((set, get) => ({
  userId: getOrCreateSessionId(),
  nickname: getStoredNickname() || '',
  isMuted: soundFx.getMuted(),
  theme: initTheme,

  setNickname: (nickname: string) => {
    const trimmed = nickname.trim().slice(0, 16);
    persistNickname(trimmed);
    set({ nickname: trimmed });
  },

  toggleMute: () => {
    const newMuted = soundFx.toggleMute();
    set({ isMuted: newMuted });
  },

  toggleTheme: () => {
    const nextTheme: ThemeMode = get().theme === 'dark' ? 'light' : 'dark';
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('domino_theme', nextTheme);
    }
    applyThemeClass(nextTheme);
    set({ theme: nextTheme });
  },

  setTheme: (newTheme: ThemeMode) => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('domino_theme', newTheme);
    }
    applyThemeClass(newTheme);
    set({ theme: newTheme });
  },
}));
