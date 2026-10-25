// SpaceDraw sound engine — MP3 only, off by default.
// Ported and extended from the provided doodleduel-sound-effects/sound.js.
// - AudioContext is created only after a user gesture (lazily on first enable/play).
// - Files load lazily via fetch + decodeAudioData; a missing file stays silent.
// - Never plays while document.hidden.
// - Honors the persisted `doodleduel:v1:sound` preference {enabled, volume}.
// - Reads optional admin overrides from `spacedraw:v1:sound-config`.
// Backward-compatible: existing `playSound(type)` / `getMuted` / `setMuted` still work.

export type SoundName =
  | 'click' | 'hover' | 'toggle-on' | 'toggle-off' | 'undo' | 'clear'
  | 'tick' | 'go' | 'timer-warning' | 'round-start' | 'round-end'
  | 'correct' | 'wrong' | 'near-miss' | 'player-join' | 'player-leave'
  | 'notification' | 'winner';

interface SoundDef { volume: number; cooldownMs: number; use: string; }

const BASE = '/assets/sounds/';
const PREF_KEY = 'doodleduel:v1:sound';
const CFG_KEY = 'spacedraw:v1:sound-config';

export const SOUNDS: Record<SoundName, SoundDef> = {
  click:           { volume: 0.6, cooldownMs: 40,  use: 'any button press' },
  hover:           { volume: 0.3, cooldownMs: 80,  use: 'optional, desktop hover only' },
  'toggle-on':     { volume: 0.7, cooldownMs: 100, use: 'switch turned on' },
  'toggle-off':    { volume: 0.7, cooldownMs: 100, use: 'switch turned off' },
  undo:            { volume: 0.6, cooldownMs: 80,  use: 'undo / redo' },
  clear:           { volume: 0.7, cooldownMs: 200, use: 'canvas cleared' },
  tick:            { volume: 0.7, cooldownMs: 300, use: 'countdown 3, 2, 1' },
  go:              { volume: 0.8, cooldownMs: 500, use: 'GO! banner' },
  'timer-warning': { volume: 0.7, cooldownMs: 800, use: 'last 10 seconds, once per second' },
  'round-start':   { volume: 0.8, cooldownMs: 800, use: 'round begins' },
  'round-end':     { volume: 0.8, cooldownMs: 800, use: 'round over' },
  correct:         { volume: 0.9, cooldownMs: 200, use: 'correct guess' },
  wrong:           { volume: 0.6, cooldownMs: 300, use: 'wrong guess (off by default)' },
  'near-miss':     { volume: 0.6, cooldownMs: 500, use: '"so close" private hint' },
  'player-join':   { volume: 0.6, cooldownMs: 200, use: 'player joins lobby' },
  'player-leave':  { volume: 0.6, cooldownMs: 200, use: 'player leaves lobby' },
  notification:    { volume: 0.7, cooldownMs: 500, use: 'invite, new message while away' },
  winner:          { volume: 0.9, cooldownMs: 3000, use: 'results screen, winner reveal' },
};

export const SOUND_NAMES = Object.keys(SOUNDS) as SoundName[];

// Sounds that are off by default even when audio is enabled.
const DEFAULT_DISABLED: SoundName[] = ['wrong', 'hover'];

interface SoundConfig {
  defaultEnabled: boolean;
  masterVolume: number;
  perSound: Partial<Record<SoundName, { enabled?: boolean; volume?: number }>>;
}

const DEFAULT_CONFIG: SoundConfig = {
  defaultEnabled: false,
  masterVolume: 0.7,
  perSound: DEFAULT_DISABLED.reduce((acc, n) => ({ ...acc, [n]: { enabled: false } }), {}),
};

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
const buffers = new Map<string, AudioBuffer | null>();
const lastPlayed = new Map<string, number>();

let state: { enabled: boolean; volume: number } = { enabled: false, volume: 0.7 };
let config: SoundConfig = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
let prefsLoaded = false;

function clamp01(v: number): number { return Math.min(1, Math.max(0, v)); }

function loadPrefs(): void {
  if (prefsLoaded || typeof window === 'undefined') return;
  prefsLoaded = true;
  let hadUserPref = false;
  try {
    const raw = window.localStorage.getItem(PREF_KEY);
    if (raw) { Object.assign(state, JSON.parse(raw)); hadUserPref = true; }
  } catch { /* ignore */ }
  try {
    const rawCfg = window.localStorage.getItem(CFG_KEY);
    if (rawCfg) {
      const parsed = JSON.parse(rawCfg) as Partial<SoundConfig>;
      config = {
        defaultEnabled: parsed.defaultEnabled ?? DEFAULT_CONFIG.defaultEnabled,
        masterVolume: typeof parsed.masterVolume === 'number' ? clamp01(parsed.masterVolume) : DEFAULT_CONFIG.masterVolume,
        perSound: { ...DEFAULT_CONFIG.perSound, ...(parsed.perSound || {}) },
      };
    }
  } catch { /* ignore */ }
  // With no explicit user preference, fall back to the admin default-enabled flag.
  if (!hadUserPref) state.enabled = !!config.defaultEnabled;
  state.volume = clamp01(state.volume);
}

function savePrefs(): void {
  if (typeof window === 'undefined') return;
  try { window.localStorage.setItem(PREF_KEY, JSON.stringify(state)); } catch { /* ignore */ }
}

function ensureContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (ctx) return ctx;
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  try {
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = clamp01(state.volume * config.masterVolume);
    master.connect(ctx.destination);
  } catch { ctx = null; }
  return ctx;
}

function applyMasterGain(): void {
  if (master) master.gain.value = clamp01(state.volume * config.masterVolume);
}

async function loadBuffer(name: string): Promise<AudioBuffer | null> {
  if (buffers.has(name)) return buffers.get(name) ?? null;
  const c = ensureContext();
  if (!c) return null;
  try {
    const res = await fetch(`${BASE}${name}.mp3`);
    if (!res.ok) throw new Error(String(res.status));
    const buf = await c.decodeAudioData(await res.arrayBuffer());
    buffers.set(name, buf);
    return buf;
  } catch {
    buffers.set(name, null); // missing/undecodable file: stay silent, never throw
    return null;
  }
}

function isSoundEnabled(name: SoundName): boolean {
  const override = config.perSound[name];
  if (override && override.enabled === false) return false;
  if (override && override.enabled === true) return true;
  return !DEFAULT_DISABLED.includes(name);
}

// ---- Public engine ----

export const sound = {
  get enabled(): boolean { loadPrefs(); return state.enabled; },
  get volume(): number { loadPrefs(); return state.volume; },
  get config(): SoundConfig { loadPrefs(); return config; },

  setEnabled(on: boolean): void {
    loadPrefs();
    state.enabled = !!on;
    savePrefs();
    if (on) {
      const c = ensureContext();
      if (c && c.state === 'suspended') c.resume().catch(() => {});
      applyMasterGain();
      void this.preload(['click', 'correct', 'tick']);
      void this.play('toggle-on');
    }
  },

  setVolume(v: number): void {
    loadPrefs();
    state.volume = clamp01(Number(v) || 0);
    savePrefs();
    applyMasterGain();
  },

  // Admin sound manager writes overrides through here (and persists to CFG_KEY).
  setConfig(next: Partial<SoundConfig>): void {
    loadPrefs();
    config = {
      defaultEnabled: next.defaultEnabled ?? config.defaultEnabled,
      masterVolume: typeof next.masterVolume === 'number' ? clamp01(next.masterVolume) : config.masterVolume,
      perSound: { ...config.perSound, ...(next.perSound || {}) },
    };
    applyMasterGain();
    if (typeof window !== 'undefined') {
      try { window.localStorage.setItem(CFG_KEY, JSON.stringify(config)); } catch { /* ignore */ }
    }
  },

  preload(names: SoundName[] = SOUND_NAMES): Promise<unknown> {
    return Promise.all(names.map((n) => loadBuffer(n)));
  },

  isMissing(name: string): boolean {
    return buffers.has(name) && buffers.get(name) === null;
  },

  async play(name: SoundName): Promise<void> {
    loadPrefs();
    const def = SOUNDS[name];
    if (!state.enabled || !def) return;
    if (typeof document !== 'undefined' && document.hidden) return;
    if (!isSoundEnabled(name)) return;

    const now = (typeof performance !== 'undefined' ? performance.now() : Date.now());
    if (now - (lastPlayed.get(name) || 0) < def.cooldownMs) return;
    lastPlayed.set(name, now);

    const c = ensureContext();
    if (!c) return;
    if (c.state === 'suspended') await c.resume().catch(() => {});
    const buf = await loadBuffer(name);
    if (!buf || !master) return;

    try {
      const src = c.createBufferSource();
      const g = c.createGain();
      const overrideVol = config.perSound[name]?.volume;
      g.gain.value = clamp01(def.volume * (typeof overrideVol === 'number' ? overrideVol : 1));
      src.buffer = buf;
      src.connect(g);
      g.connect(master);
      src.start();
    } catch { /* ignore playback errors */ }
  },
};

export const play = (name: SoundName): void => { void sound.play(name); };

// ---- Backward-compatible legacy API ----

const LEGACY_MAP: Record<string, SoundName> = {
  click: 'click',
  tick: 'tick',
  start: 'round-start',
  correct: 'correct',
  wrong: 'wrong',
  end: 'round-end',
  fanfare: 'winner',
};

export function playSound(type: 'click' | 'tick' | 'start' | 'correct' | 'wrong' | 'end' | 'fanfare'): void {
  play(LEGACY_MAP[type] || 'click');
}

export function setMuted(muted: boolean): void { sound.setEnabled(!muted); }
export function getMuted(): boolean { return !sound.enabled; }
export function getVolume(): number { return sound.volume; }
export function setVolume(v: number): void { sound.setVolume(v); }
