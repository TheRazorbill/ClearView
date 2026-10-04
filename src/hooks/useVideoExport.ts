import { useState, useRef } from 'react';
import { ExportOptions, ExportProgress } from '../types/exportTypes';
import { SubtitleConfig, VideoFilters } from '../types/playerSettings';
import { Cue } from '../utils/subtitles';
import { renderCustomizedVideo } from '../services/videoExportService';

export function useVideoExport() {
  const [modalOpen, setModalOpen] = useState(false);
  const [options, setOptions] = useState<ExportOptions>({
    range: 'all',
    includeAudioFx: true,
    includeVideoFx: true,
    includeSubtitles: true,
    quality: 'high',
  });

  const [progress, setProgress] = useState<ExportProgress>({
    percent: 0,
    stage: 'idle',
    currentSecond: 0,
    totalSeconds: 0,
  });

  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const startExport = async ({
    videoElement,
    videoFilters,
    subtitleConfig,
    cues,
    loopStart,
    loopEnd,
    audioDestinationNode,
  }: {
    videoElement: HTMLVideoElement;
    videoFilters: VideoFilters;
    subtitleConfig: SubtitleConfig;
    cues: Cue[];
    loopStart: number | null;
    loopEnd: number | null;
    audioDestinationNode?: MediaStreamAudioDestinationNode;
  }) => {
    setDownloadUrl(null);
    abortControllerRef.current = new AbortController();

    const duration = videoElement.duration || 10;
    const startTime = options.range === 'loop' && loopStart !== null ? loopStart : 0;
    const endTime = options.range === 'loop' && loopEnd !== null ? Math.min(duration, loopEnd) : duration;

    setProgress({
      percent: 0,
      stage: 'preparing',
      currentSecond: 0,
      totalSeconds: Math.max(0.1, endTime - startTime),
    });

    try {
      const blob = await renderCustomizedVideo({
        videoElement,
        options,
        videoFilters,
        subtitleConfig,
        cues,
        startTime,
        endTime,
        audioDestinationNode,
        onProgress: setProgress,
        signal: abortControllerRef.current.signal,
      });

      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setProgress((prev) => ({
          ...prev,
          stage: 'error',
          error: (err as Error).message,
        }));
      }
    }
  };

  const cancelExport = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setProgress({
      percent: 0,
      stage: 'idle',
      currentSecond: 0,
      totalSeconds: 0,
    });
  };

  const closeModal = () => {
    cancelExport();
    setModalOpen(false);
  };

  return {
    modalOpen,
    setModalOpen,
    options,
    setOptions,
    progress,
    downloadUrl,
    startExport,
    cancelExport,
    closeModal,
  };
}
