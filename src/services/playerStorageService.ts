import { AudioSettings } from '../hooks/useVideoAudioEnhancer';
import {
  AspectRatioMode,
  SubtitleConfig,
  VideoChapter,
  VideoFilters,
  VideoSummary,
} from '../types/playerSettings';
import { Cue } from '../utils/subtitles';

export interface SavedVideoConfig {
  filters: VideoFilters;
  aspectRatio: AspectRatioMode;
}

export interface SavedAllProfile {
  savedAt: number;
  audio: AudioSettings;
  video: SavedVideoConfig;
  subtitleConfig: SubtitleConfig;
}

const STORAGE_KEYS = {
  AUDIO: 'clearview.saved.audio',
  VIDEO: 'clearview.saved.video',
  SUBTITLES_CONFIG: 'clearview.saved.subtitles_config',
  ALL_PROFILE: 'clearview.saved.all_profile',
  mediaSubtitles: (mediaName: string) => `clearview.subtitles.${mediaName}`,
  mediaChapters: (mediaName: string) => `clearview.chapters.${mediaName}`,
  mediaSummary: (mediaName: string) => `clearview.summary.${mediaName}`,
};

export function saveAudioConfig(settings: AudioSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.AUDIO, JSON.stringify(settings));
  } catch {
    /* empty */
  }
}

export function loadSavedAudioConfig(): AudioSettings | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AUDIO);
    if (!raw) return null;
    return JSON.parse(raw) as AudioSettings;
  } catch {
    return null;
  }
}

export function hasSavedAudioConfig(): boolean {
  try {
    return Boolean(localStorage.getItem(STORAGE_KEYS.AUDIO));
  } catch {
    return false;
  }
}

export function clearSavedAudioConfig(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.AUDIO);
  } catch {
    /* empty */
  }
}

export function saveVideoConfig(
  filtersOrConfig: VideoFilters | SavedVideoConfig,
  aspectRatio?: AspectRatioMode,
): void {
  try {
    const payload: SavedVideoConfig =
      'filters' in filtersOrConfig && 'aspectRatio' in filtersOrConfig
        ? (filtersOrConfig as SavedVideoConfig)
        : { filters: filtersOrConfig as VideoFilters, aspectRatio: aspectRatio || 'contain' };
    localStorage.setItem(STORAGE_KEYS.VIDEO, JSON.stringify(payload));
  } catch {
    /* empty */
  }
}

export function loadSavedVideoConfig(): SavedVideoConfig | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.VIDEO);
    if (!raw) return null;
    return JSON.parse(raw) as SavedVideoConfig;
  } catch {
    return null;
  }
}

export function hasSavedVideoConfig(): boolean {
  try {
    return Boolean(localStorage.getItem(STORAGE_KEYS.VIDEO));
  } catch {
    return false;
  }
}

export function clearSavedVideoConfig(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.VIDEO);
  } catch {
    /* empty */
  }
}

export function saveSubtitleVisualConfig(config: SubtitleConfig): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SUBTITLES_CONFIG, JSON.stringify(config));
  } catch {
    /* empty */
  }
}

export function loadSavedSubtitleVisualConfig(): SubtitleConfig | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SUBTITLES_CONFIG);
    if (!raw) return null;
    return JSON.parse(raw) as SubtitleConfig;
  } catch {
    return null;
  }
}

export function saveAllProfile(
  audioOrProfile:
    | AudioSettings
    | { audio: AudioSettings; video: SavedVideoConfig; subtitleVisual?: SubtitleConfig; subtitleConfig?: SubtitleConfig },
  video?: SavedVideoConfig,
  subtitleConfig?: SubtitleConfig,
): void {
  try {
    let audioSettings: AudioSettings;
    let videoConfig: SavedVideoConfig;
    let subConfig: SubtitleConfig;

    if ('audio' in audioOrProfile && 'video' in audioOrProfile) {
      audioSettings = audioOrProfile.audio;
      videoConfig = audioOrProfile.video;
      subConfig =
        audioOrProfile.subtitleVisual ||
        audioOrProfile.subtitleConfig || {
          size: 'base',
          bg: 'translucent',
          position: 'bottom',
          offsetSec: 0,
        };
    } else {
      audioSettings = audioOrProfile as AudioSettings;
      videoConfig = video!;
      subConfig = subtitleConfig!;
    }

    const profile: SavedAllProfile = {
      savedAt: Date.now(),
      audio: audioSettings,
      video: videoConfig,
      subtitleConfig: subConfig,
    };
    localStorage.setItem(STORAGE_KEYS.ALL_PROFILE, JSON.stringify(profile));
    saveAudioConfig(audioSettings);
    saveVideoConfig(videoConfig);
    saveSubtitleVisualConfig(subConfig);
  } catch {
    /* empty */
  }
}

export function loadSavedAllProfile(): SavedAllProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ALL_PROFILE);
    if (!raw) return null;
    return JSON.parse(raw) as SavedAllProfile;
  } catch {
    return null;
  }
}

export function saveMediaSubtitles(mediaName: string, cues: Cue[]): void {
  if (!mediaName) return;
  try {
    localStorage.setItem(STORAGE_KEYS.mediaSubtitles(mediaName), JSON.stringify(cues));
  } catch {
    /* empty */
  }
}

export function loadMediaSubtitles(mediaName: string): Cue[] | null {
  if (!mediaName) return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.mediaSubtitles(mediaName));
    if (!raw) return null;
    return JSON.parse(raw) as Cue[];
  } catch {
    return null;
  }
}

export function clearMediaSubtitles(mediaName: string): void {
  if (!mediaName) return;
  try {
    localStorage.removeItem(STORAGE_KEYS.mediaSubtitles(mediaName));
  } catch {
    /* empty */
  }
}

export function saveMediaChapters(mediaName: string, chapters: VideoChapter[]): void {
  if (!mediaName) return;
  try {
    localStorage.setItem(STORAGE_KEYS.mediaChapters(mediaName), JSON.stringify(chapters));
  } catch {
    /* empty */
  }
}

export function loadMediaChapters(mediaName: string): VideoChapter[] | null {
  if (!mediaName) return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.mediaChapters(mediaName));
    if (!raw) return null;
    return JSON.parse(raw) as VideoChapter[];
  } catch {
    return null;
  }
}

export function saveMediaSummary(mediaName: string, summary: VideoSummary): void {
  if (!mediaName) return;
  try {
    localStorage.setItem(STORAGE_KEYS.mediaSummary(mediaName), JSON.stringify(summary));
  } catch {
    /* empty */
  }
}

export function loadMediaSummary(mediaName: string): VideoSummary | null {
  if (!mediaName) return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.mediaSummary(mediaName));
    if (!raw) return null;
    return JSON.parse(raw) as VideoSummary;
  } catch {
    return null;
  }
}
