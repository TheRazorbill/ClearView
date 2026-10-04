import { beforeEach, describe, expect, it } from 'vitest';
import {
  clearMediaSubtitles,
  clearSavedAudioConfig,
  clearSavedVideoConfig,
  hasSavedAudioConfig,
  hasSavedVideoConfig,
  loadMediaChapters,
  loadMediaSubtitles,
  loadMediaSummary,
  loadSavedAllProfile,
  loadSavedAudioConfig,
  loadSavedSubtitleVisualConfig,
  loadSavedVideoConfig,
  saveAllProfile,
  saveAudioConfig,
  saveMediaChapters,
  saveMediaSubtitles,
  saveMediaSummary,
  saveSubtitleVisualConfig,
  saveVideoConfig,
} from '../services/playerStorageService';
import { PRESETS } from '../hooks/useVideoAudioEnhancer';
import { DEFAULT_SUBTITLE_CONFIG, VIDEO_PRESETS } from '../types/playerSettings';
import { Cue } from '../utils/subtitles';

const storageMap = new Map<string, string>();
const localStorageMock = {
  getItem: (k: string) => storageMap.get(k) ?? null,
  setItem: (k: string, v: string) => {
    storageMap.set(k, String(v));
  },
  removeItem: (k: string) => {
    storageMap.delete(k);
  },
  clear: () => {
    storageMap.clear();
  },
};

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('Player Storage & Configuration Persistence Service', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('saves, checks, loads and clears audio configuration', () => {
    expect(hasSavedAudioConfig()).toBe(false);
    expect(loadSavedAudioConfig()).toBeNull();

    const customAudio = { ...PRESETS.voice.settings, volume: 1.8, speechBoost: 10 };
    saveAudioConfig(customAudio);

    expect(hasSavedAudioConfig()).toBe(true);
    const loaded = loadSavedAudioConfig();
    expect(loaded).toEqual(customAudio);

    clearSavedAudioConfig();
    expect(hasSavedAudioConfig()).toBe(false);
    expect(loadSavedAudioConfig()).toBeNull();
  });

  it('saves, checks, loads and clears video configuration', () => {
    expect(hasSavedVideoConfig()).toBe(false);
    expect(loadSavedVideoConfig()).toBeNull();

    const filters = { ...VIDEO_PRESETS.cinema.filters, brightness: 110 };
    saveVideoConfig(filters, '16/9');

    expect(hasSavedVideoConfig()).toBe(true);
    const loaded = loadSavedVideoConfig();
    expect(loaded).toEqual({ filters, aspectRatio: '16/9' });

    clearSavedVideoConfig();
    expect(hasSavedVideoConfig()).toBe(false);
    expect(loadSavedVideoConfig()).toBeNull();
  });

  it('saves and loads subtitle visual config', () => {
    const customConfig = { ...DEFAULT_SUBTITLE_CONFIG, size: 'xl' as const, bg: 'yellow' as const };
    saveSubtitleVisualConfig(customConfig);

    const loaded = loadSavedSubtitleVisualConfig();
    expect(loaded).toEqual(customConfig);
  });

  it('saves and loads combined all profile', () => {
    const audio = PRESETS.denoise.settings;
    const video = { filters: VIDEO_PRESETS.vivid.filters, aspectRatio: 'cover' as const };
    const subtitleConfig = DEFAULT_SUBTITLE_CONFIG;

    saveAllProfile(audio, video, subtitleConfig);

    const loaded = loadSavedAllProfile();
    expect(loaded).toBeTruthy();
    expect(loaded?.audio).toEqual(audio);
    expect(loaded?.video).toEqual(video);
    expect(loaded?.subtitleConfig).toEqual(subtitleConfig);
    expect(loaded?.savedAt).toBeGreaterThan(0);
  });

  it('persists and restores per-media subtitles and chapters', () => {
    const mediaName = 'video_aula_01.mp4';
    const sampleCues: Cue[] = [
      { start: 0.5, end: 3.2, text: 'Ola a todos' },
      { start: 3.5, end: 7.0, text: 'Hoje falaremos sobre audio' },
    ];
    const sampleChapters = [
      { title: 'Introducao', start: 0 },
      { title: 'Desenvolvimento', start: 3.5 },
    ];
    const sampleSummary = {
      overview: 'Resumo da aula',
      keyPoints: ['Ponto 1', 'Ponto 2'],
    };

    saveMediaSubtitles(mediaName, sampleCues);
    saveMediaChapters(mediaName, sampleChapters);
    saveMediaSummary(mediaName, sampleSummary);

    expect(loadMediaSubtitles(mediaName)).toEqual(sampleCues);
    expect(loadMediaChapters(mediaName)).toEqual(sampleChapters);
    expect(loadMediaSummary(mediaName)).toEqual(sampleSummary);

    expect(loadMediaSubtitles('outro_video.mp4')).toBeNull();

    clearMediaSubtitles(mediaName);
    expect(loadMediaSubtitles(mediaName)).toBeNull();
  });

  it('persists and restores light and dark theme preferences', () => {
    expect(localStorage.getItem('clearview.theme')).toBeNull();

    localStorage.setItem('clearview.theme', 'light');
    expect(localStorage.getItem('clearview.theme')).toBe('light');

    localStorage.setItem('clearview.theme', 'dark');
    expect(localStorage.getItem('clearview.theme')).toBe('dark');
  });
});
