export type ExportRange = 'all' | 'loop';
export type ExportQuality = 'high' | 'medium';

export interface ExportOptions {
  range: ExportRange;
  includeAudioFx: boolean;
  includeVideoFx: boolean;
  includeSubtitles: boolean;
  quality: ExportQuality;
}

export type ExportStage = 'idle' | 'preparing' | 'rendering' | 'encoding' | 'done' | 'error';

export interface ExportProgress {
  percent: number;
  stage: ExportStage;
  currentSecond: number;
  totalSeconds: number;
  error?: string;
}
