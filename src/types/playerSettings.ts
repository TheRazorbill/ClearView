export interface VideoFilters {
  brightness: number;
  contrast: number;
  saturate: number;
  grayscale: number;
  sepia: number;
  hueRotate: number;
  invert: number;
  blur: number;
}

export const DEFAULT_VIDEO_FILTERS: VideoFilters = {
  brightness: 100,
  contrast: 100,
  saturate: 100,
  grayscale: 0,
  sepia: 0,
  hueRotate: 0,
  invert: 0,
  blur: 0,
};

export type VideoFilterPresetId = 'normal' | 'cinema' | 'night_boost' | 'vivid' | 'bw' | 'warm';

export const VIDEO_PRESETS: Record<VideoFilterPresetId, { label: string; desc: string; filters: VideoFilters }> = {
  normal: {
    label: 'Normal / Original',
    desc: 'Sem alterações nas cores do vídeo.',
    filters: { brightness: 100, contrast: 100, saturate: 100, grayscale: 0, sepia: 0, hueRotate: 0, invert: 0, blur: 0 },
  },
  cinema: {
    label: 'Cinema (Alto Contraste)',
    desc: 'Pretos mais profundos e leve saturação.',
    filters: { brightness: 95, contrast: 125, saturate: 115, grayscale: 0, sepia: 0, hueRotate: 0, invert: 0, blur: 0 },
  },
  night_boost: {
    label: 'Clarear Vídeo Escuro',
    desc: 'Eleva sombras e brilho para vídeos gravados à noite.',
    filters: { brightness: 135, contrast: 110, saturate: 105, grayscale: 0, sepia: 0, hueRotate: 0, invert: 0, blur: 0 },
  },
  vivid: {
    label: 'HDR / Cores Vívidas',
    desc: 'Realça cores e vivacidade para animações e natureza.',
    filters: { brightness: 105, contrast: 115, saturate: 155, grayscale: 0, sepia: 0, hueRotate: 0, invert: 0, blur: 0 },
  },
  bw: {
    label: 'Preto & Branco Clássico',
    desc: 'Estilo cinematográfico monocromático.',
    filters: { brightness: 100, contrast: 120, saturate: 0, grayscale: 100, sepia: 0, hueRotate: 0, invert: 0, blur: 0 },
  },
  warm: {
    label: 'Tom Quente / Conforto Visual',
    desc: 'Reduz luz azul cansativa com leve tom sépia/âmbar.',
    filters: { brightness: 98, contrast: 100, saturate: 95, grayscale: 0, sepia: 30, hueRotate: 340, invert: 0, blur: 0 },
  },
};

export type SubtitleSize = 'sm' | 'base' | 'lg' | 'xl' | '2xl' | 'small' | 'medium' | 'large' | 'xlarge';
export type SubtitleBg = 'translucent' | 'solid' | 'none' | 'yellow';
export type SubtitlePosition = 'bottom' | 'top';

export interface SubtitleConfig {
  size: SubtitleSize;
  bg: SubtitleBg;
  position: SubtitlePosition;
  offsetSec: number;
}

export const DEFAULT_SUBTITLE_CONFIG: SubtitleConfig = {
  size: 'base',
  bg: 'translucent',
  position: 'bottom',
  offsetSec: 0,
};

export type AspectRatioMode = 'contain' | 'cover' | 'fill' | '16/9' | '4/3' | 'original' | '1:1' | '21:9';

export interface EqualizerBands {
  sub60: number;
  low250: number;
  mid1k: number;
  pres4k: number;
  high12k: number;
  b60?: number;
  b250?: number;
  b1k?: number;
  b4k?: number;
  b12k?: number;
}

export type ChannelMode = 'stereo' | 'mono' | 'left-only' | 'right-only';

export interface VideoChapter {
  title: string;
  start: number;
}

export interface VideoSummary {
  overview: string;
  keyPoints: string[];
}

export interface VideoChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp?: number;
  answer?: string;
  matchedTime?: number;
}

export interface Bookmark {
  id: string;
  time: number;
  note?: string;
  createdAt: number;
}

export interface LoopAB {
  enabled: boolean;
  start: number | null;
  end: number | null;
}

export interface ZoomPan {
  scale: number;
  x: number;
  y: number;
}
