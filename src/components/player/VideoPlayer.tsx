import { RefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Cue, cuesToVtt, formatClock } from '../../utils/subtitles';
import {
  AspectRatioMode,
  Bookmark,
  LoopAB,
  SubtitleConfig,
  VideoChapter,
  VideoFilters,
  ZoomPan,
} from '../../types/playerSettings';
import { PlayerControls } from './PlayerControls';
import { PlayerOverlays } from './PlayerOverlays';
import { SPEED_OPTIONS } from './SpeedMenu';

export interface VideoPlayerProps {
  videoRef: RefObject<HTMLVideoElement>;
  src: string;
  mediaKey: string;
  isRemote: boolean;
  cues: Cue[];
  chapters: VideoChapter[];
  bookmarks: Bookmark[];
  onAddBookmark: (time: number) => void;
  subtitlesOn: boolean;
  subtitleConfig: SubtitleConfig;
  videoFilters: VideoFilters;
  aspectRatio: AspectRatioMode;
  loopAB: LoopAB;
  onSetLoopA: () => void;
  onSetLoopB: () => void;
  onClearLoopAB: () => void;
  onToggleSubtitles: () => void;
  onSubtitleFile: (file: File) => void;
  onUserGesture: () => void;
  onTimeUpdate: (t: number) => void;
  onError: (msg: string) => void;
  onOpenSubtitleSettings: () => void;
  onOpenVideoFilterSettings: () => void;
  onOpenStudioTab: (tab: 'audio' | 'video' | 'subtitles' | 'transcript' | 'ai' | 'bookmarks') => void;
  onOpenExportModal?: () => void;
}

const FRAME_DURATION = 1 / 30;

export default function VideoPlayer({
  videoRef,
  src,
  mediaKey,
  isRemote,
  cues,
  chapters,
  bookmarks,
  onAddBookmark,
  subtitlesOn,
  subtitleConfig,
  videoFilters,
  aspectRatio,
  loopAB,
  onSetLoopA,
  onSetLoopB,
  onClearLoopAB,
  onToggleSubtitles,
  onSubtitleFile,
  onUserGesture,
  onTimeUpdate,
  onError,
  onOpenExportModal,
}: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [speedMenuOpen, setSpeedMenuOpen] = useState(false);
  const [loop, setLoop] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [idle, setIdle] = useState(false);
  const [dragSub, setDragSub] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);

  const [resumeTime, setResumeTime] = useState<number | null>(null);
  const [zoomPan, setZoomPan] = useState<ZoomPan>({ scale: 1, x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const idleTimer = useRef<number>();

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`clearview.progress.${mediaKey}`);
      if (saved) {
        const val = parseFloat(saved);
        if (val > 5) {
          setResumeTime(val);
        }
      }
    } catch {
      /* empty */
    }
  }, [mediaKey]);

  useEffect(() => {
    if (time > 3 && duration > 10) {
      try {
        localStorage.setItem(`clearview.progress.${mediaKey}`, time.toString());
      } catch {
        /* empty */
      }
    }
  }, [time, duration, mediaKey]);

  const showFlash = useCallback((txt: string) => {
    setFlash(txt);
    window.setTimeout(() => setFlash(null), 650);
  }, []);

  const handleResume = () => {
    if (resumeTime && videoRef.current) {
      videoRef.current.currentTime = resumeTime;
      setResumeTime(null);
      showFlash(`Retomado em ${formatClock(resumeTime)}`);
    }
  };

  const handleDismissResume = () => {
    setResumeTime(null);
  };

  const trackUrl = useMemo(
    () => (cues.length ? URL.createObjectURL(new Blob([cuesToVtt(cues)], { type: 'text/vtt' })) : null),
    [cues],
  );
  useEffect(() => () => { if (trackUrl) URL.revokeObjectURL(trackUrl); }, [trackUrl]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    for (const t of Array.from(v.textTracks)) t.mode = 'hidden';
  }, [trackUrl, videoRef]);

  const adjustedTime = time - (subtitleConfig.offsetSec || 0);
  const activeCue = subtitlesOn
    ? cues.find((c) => adjustedTime >= c.start && adjustedTime < c.end)
    : undefined;

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    onUserGesture();
    if (v.paused) v.play().catch((e) => onError('Nao foi possivel reproduzir: ' + e.message));
    else v.pause();
  }, [videoRef, onUserGesture, onError]);

  const seekBy = useCallback(
    (d: number) => {
      const v = videoRef.current;
      if (!v) return;
      v.currentTime = Math.max(0, Math.min(v.duration || 0, v.currentTime + d));
      showFlash(d > 0 ? `+${d}s` : `${d}s`);
    },
    [videoRef, showFlash],
  );

  const stepFrame = useCallback(
    (frames: number) => {
      const v = videoRef.current;
      if (!v) return;
      v.pause();
      v.currentTime = Math.max(0, Math.min(v.duration || 0, v.currentTime + frames * FRAME_DURATION));
      showFlash(frames > 0 ? '+1 frame' : '-1 frame');
    },
    [videoRef, showFlash],
  );

  const toggleMute = useCallback(() => {
    const v = videoRef.current;
    if (v) v.muted = !v.muted;
  }, [videoRef]);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen();
    else containerRef.current?.requestFullscreen();
  }, []);

  const changeSpeed = useCallback(
    (speed: number) => {
      const v = videoRef.current;
      if (!v) return;
      v.playbackRate = speed;
      (v as unknown as { preservesPitch?: boolean }).preservesPitch = true;
      setPlaybackSpeed(speed);
      setSpeedMenuOpen(false);
      showFlash(`${speed}x`);
    },
    [videoRef, showFlash],
  );

  const togglePiP = useCallback(async () => {
    const v = videoRef.current;
    if (!v) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await v.requestPictureInPicture();
      }
    } catch {
      onError('Picture in Picture nao suportado neste navegador.');
    }
  }, [videoRef, onError]);

  const toggleLoop = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.loop = !v.loop;
    setLoop(v.loop);
    showFlash(v.loop ? 'Repetir: Ativado' : 'Repetir: Desativado');
  }, [videoRef, showFlash]);

  const adjustZoom = (delta: number) => {
    setZoomPan((prev) => {
      const newScale = Math.min(4.0, Math.max(1.0, +(prev.scale + delta).toFixed(2)));
      if (newScale === 1.0) return { scale: 1.0, x: 0, y: 0 };
      return { ...prev, scale: newScale };
    });
  };

  const resetZoom = () => {
    setZoomPan({ scale: 1.0, x: 0, y: 0 });
    showFlash('Zoom 100%');
  };

  const captureScreenshot = useCallback(() => {
    const v = videoRef.current;
    if (!v || !v.videoWidth || !v.videoHeight) {
      onError('Nao foi possivel capturar o frame do video.');
      return;
    }
    try {
      const canvas = document.createElement('canvas');
      canvas.width = v.videoWidth;
      canvas.height = v.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.filter = `brightness(${videoFilters.brightness}%) contrast(${videoFilters.contrast}%) saturate(${videoFilters.saturate}%) grayscale(${videoFilters.grayscale}%) sepia(${videoFilters.sepia}%) hue-rotate(${videoFilters.hueRotate}deg)`;
      ctx.drawImage(v, 0, 0, canvas.width, canvas.height);

      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `frame-${Math.floor(v.currentTime)}s.png`;
      a.click();
      showFlash('Screenshot salva');
    } catch {
      onError('Erro ao salvar screenshot (CORS pode bloquear URLs externas).');
    }
  }, [videoRef, videoFilters, onError, showFlash]);

  useEffect(() => {
    const onFs = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFs);
    return () => document.removeEventListener('fullscreenchange', onFs);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'j':
        case 'arrowleft':
          seekBy(-10);
          break;
        case 'l':
        case 'arrowright':
          seekBy(10);
          break;
        case ',':
          stepFrame(-1);
          break;
        case '.':
          stepFrame(1);
          break;
        case 'm':
          toggleMute();
          break;
        case 'f':
          toggleFullscreen();
          break;
        case 'c':
          onToggleSubtitles();
          showFlash(subtitlesOn ? 'Legendas off' : 'Legendas on');
          break;
        case 'b':
          onAddBookmark(time);
          showFlash(`Marcador salvo em ${formatClock(time)}`);
          break;
        case '[': {
          const idx = SPEED_OPTIONS.indexOf(playbackSpeed);
          if (idx > 0) changeSpeed(SPEED_OPTIONS[idx - 1]);
          break;
        }
        case ']': {
          const idx = SPEED_OPTIONS.indexOf(playbackSpeed);
          if (idx < SPEED_OPTIONS.length - 1) changeSpeed(SPEED_OPTIONS[idx + 1]);
          break;
        }
        case 's':
          captureScreenshot();
          break;
        case 'p':
          togglePiP();
          break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [
    togglePlay,
    seekBy,
    stepFrame,
    toggleMute,
    toggleFullscreen,
    onToggleSubtitles,
    subtitlesOn,
    onAddBookmark,
    time,
    playbackSpeed,
    changeSpeed,
    captureScreenshot,
    togglePiP,
    showFlash,
  ]);

  const poke = () => {
    setIdle(false);
    window.clearTimeout(idleTimer.current);
    idleTimer.current = window.setTimeout(() => setIdle(true), 2500);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragSub(false);
    const f = e.dataTransfer.files[0];
    if (!f) return;
    if (/\.(srt|vtt)$/i.test(f.name)) onSubtitleFile(f);
    else onError('Solte um arquivo .srt ou .vtt sobre o player para carregar legendas.');
  };

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const curr = e.currentTarget.currentTime;
    setTime(curr);
    onTimeUpdate(curr);

    if (loopAB.enabled && loopAB.start !== null && loopAB.end !== null) {
      if (curr >= loopAB.end) {
        e.currentTarget.currentTime = loopAB.start;
      }
    }
  };

  const progress = duration ? (time / duration) * 100 : 0;
  const hideUi = idle && playing && !speedMenuOpen;

  const filterStyle = `brightness(${videoFilters.brightness}%) contrast(${videoFilters.contrast}%) saturate(${videoFilters.saturate}%) grayscale(${videoFilters.grayscale}%) sepia(${videoFilters.sepia}%) hue-rotate(${videoFilters.hueRotate}deg)`;

  const getAspectClass = () => {
    switch (aspectRatio) {
      case 'cover':
        return 'object-cover w-full h-full';
      case '16/9':
        return 'object-fill aspect-video w-full h-auto';
      case '4/3':
        return 'object-fill aspect-[4/3] w-full h-auto';
      case 'fill':
        return 'object-fill w-full h-full';
      case 'contain':
      default:
        return 'object-contain max-h-full w-full';
    }
  };

  return (
    <div
      ref={containerRef}
      id="player"
      onMouseMove={poke}
      onDragOver={(e) => {
        e.preventDefault();
        setDragSub(true);
      }}
      onDragLeave={() => setDragSub(false)}
      onDrop={onDrop}
      className={`group relative flex w-full flex-1 items-center justify-center overflow-hidden bg-black select-none ${
        fullscreen ? '' : 'rounded-lg border border-zinc-900 shadow-2xl'
      } ${hideUi ? 'cursor-none' : ''}`}
    >
      {/* Video Element with Pan and Zoom Support */}
      <div
        className="w-full h-full flex items-center justify-center overflow-hidden"
        onMouseDown={(e) => {
          if (zoomPan.scale > 1) {
            isDraggingRef.current = true;
            dragStartRef.current = { x: e.clientX - zoomPan.x, y: e.clientY - zoomPan.y };
          }
        }}
        onMouseMove={(e) => {
          if (isDraggingRef.current && zoomPan.scale > 1) {
            setZoomPan((prev) => ({
              ...prev,
              x: e.clientX - dragStartRef.current.x,
              y: e.clientY - dragStartRef.current.y,
            }));
          }
        }}
        onMouseUp={() => {
          isDraggingRef.current = false;
        }}
        onMouseLeave={() => {
          isDraggingRef.current = false;
        }}
      >
        <video
          ref={videoRef}
          src={src}
          crossOrigin={isRemote ? 'anonymous' : undefined}
          style={{
            filter: filterStyle,
            transform:
              zoomPan.scale > 1
                ? `scale(${zoomPan.scale}) translate(${zoomPan.x / zoomPan.scale}px, ${zoomPan.y / zoomPan.scale}px)`
                : 'none',
            cursor: zoomPan.scale > 1 ? 'grab' : 'default',
          }}
          className={`transition-all duration-100 ${getAspectClass()}`}
          onClick={togglePlay}
          onDoubleClick={toggleFullscreen}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          onVolumeChange={(e) => {
            setVolume(e.currentTarget.volume);
            setMuted(e.currentTarget.muted);
          }}
          onError={() =>
            onError(
              isRemote
                ? 'Falha ao carregar a URL. Verifique se e um link direto para o arquivo e se o servidor permite CORS.'
                : 'O navegador nao conseguiu decodificar este video (codec nao suportado).',
            )
          }
        >
          {trackUrl && <track key={trackUrl} kind="subtitles" src={trackUrl} srcLang="und" label="Legendas" default />}
        </video>
      </div>

      {/* Overlays */}
      <PlayerOverlays
        activeCue={activeCue}
        subtitleConfig={subtitleConfig}
        hideUi={hideUi}
        resumeTime={resumeTime}
        onResume={handleResume}
        onDismissResume={handleDismissResume}
        flash={flash}
        zoomScale={zoomPan.scale}
        onResetZoom={resetZoom}
        playing={playing}
        onTogglePlay={togglePlay}
        dragSub={dragSub}
      />

      {/* Controls Ribbon */}
      <PlayerControls
        time={time}
        duration={duration}
        progress={progress}
        playing={playing}
        volume={volume}
        muted={muted}
        playbackSpeed={playbackSpeed}
        speedMenuOpen={speedMenuOpen}
        loop={loop}
        fullscreen={fullscreen}
        subtitlesOn={subtitlesOn}
        cuesCount={cues.length}
        chapters={chapters}
        bookmarks={bookmarks}
        loopAB={loopAB}
        hideUi={hideUi}
        onSeek={(t) => {
          const v = videoRef.current;
          if (v) v.currentTime = t;
        }}
        onTogglePlay={togglePlay}
        onStepFrame={stepFrame}
        onSeekBy={seekBy}
        onToggleMute={toggleMute}
        onChangeVolume={(vol) => {
          const v = videoRef.current;
          if (v) {
            v.volume = vol;
            v.muted = false;
          }
        }}
        onSetLoopA={onSetLoopA}
        onSetLoopB={onSetLoopB}
        onClearLoopAB={onClearLoopAB}
        onAddBookmark={onAddBookmark}
        onAdjustZoom={adjustZoom}
        onToggleSpeedMenu={() => setSpeedMenuOpen(!speedMenuOpen)}
        onSelectSpeed={changeSpeed}
        onCaptureScreenshot={captureScreenshot}
        onTogglePiP={togglePiP}
        onToggleLoop={toggleLoop}
        onToggleSubtitles={onToggleSubtitles}
        onToggleFullscreen={toggleFullscreen}
        onOpenExportModal={onOpenExportModal}
      />
    </div>
  );
}
