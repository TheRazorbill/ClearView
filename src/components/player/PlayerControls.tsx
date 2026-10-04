import React from 'react';
import {
  BookmarkPlus,
  Camera,
  Captions,
  CaptionsOff,
  ChevronLeft,
  ChevronRight,
  Download,
  Maximize,
  Minimize,
  Pause,
  PictureInPicture2,
  Play,
  Repeat,
  RotateCcw,
  RotateCw,
  Volume1,
  Volume2,
  VolumeX,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { Bookmark, LoopAB, VideoChapter } from '../../types/playerSettings';
import { formatClock } from '../../utils/subtitles';
import { useTranslation } from '../../i18n/I18nContext';
import { SpeedMenu } from './SpeedMenu';

interface PlayerControlsProps {
  time: number;
  duration: number;
  progress: number;
  playing: boolean;
  volume: number;
  muted: boolean;
  playbackSpeed: number;
  speedMenuOpen: boolean;
  loop: boolean;
  fullscreen: boolean;
  subtitlesOn: boolean;
  cuesCount: number;
  chapters: VideoChapter[];
  bookmarks: Bookmark[];
  loopAB: LoopAB;
  hideUi: boolean;
  onSeek: (time: number) => void;
  onTogglePlay: () => void;
  onStepFrame: (frames: number) => void;
  onSeekBy: (delta: number) => void;
  onToggleMute: () => void;
  onChangeVolume: (volume: number) => void;
  onSetLoopA: () => void;
  onSetLoopB: () => void;
  onClearLoopAB: () => void;
  onAddBookmark: (time: number) => void;
  onAdjustZoom: (delta: number) => void;
  onToggleSpeedMenu: () => void;
  onSelectSpeed: (speed: number) => void;
  onCaptureScreenshot: () => void;
  onTogglePiP: () => void;
  onToggleLoop: () => void;
  onToggleSubtitles: () => void;
  onToggleFullscreen: () => void;
  onOpenExportModal?: () => void;
}

export const PlayerControls: React.FC<PlayerControlsProps> = ({
  time,
  duration,
  progress,
  playing,
  volume,
  muted,
  playbackSpeed,
  speedMenuOpen,
  loop,
  fullscreen,
  subtitlesOn,
  cuesCount,
  chapters,
  bookmarks,
  loopAB,
  hideUi,
  onSeek,
  onTogglePlay,
  onStepFrame,
  onSeekBy,
  onToggleMute,
  onChangeVolume,
  onSetLoopA,
  onSetLoopB,
  onClearLoopAB,
  onAddBookmark,
  onAdjustZoom,
  onToggleSpeedMenu,
  onSelectSpeed,
  onCaptureScreenshot,
  onTogglePiP,
  onToggleLoop,
  onToggleSubtitles,
  onToggleFullscreen,
  onOpenExportModal,
}) => {
  const { t } = useTranslation();
  const VolIcon = muted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  return (
    <div
      role="region"
      aria-label="Controles de reprodução do vídeo"
      className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent px-2.5 sm:px-4 pb-2 sm:pb-3 pt-8 sm:pt-12 transition-opacity duration-300 z-30 ${
        hideUi ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="relative mb-2 sm:mb-3 flex items-center">
        <input
          id="seek-bar"
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={time}
          aria-label="Progresso da reprodução"
          aria-valuemin={0}
          aria-valuemax={Math.round(duration)}
          aria-valuenow={Math.round(time)}
          aria-valuetext={`${formatClock(time)} de ${formatClock(duration)}`}
          style={{ ['--fill' as string]: `${progress}%` }}
          onChange={(e) => onSeek(parseFloat(e.target.value))}
          className="w-full relative z-10 cursor-pointer"
        />

        {duration > 0 &&
          chapters.map((ch, i) => {
            const leftPercent = (ch.start / duration) * 100;
            return (
              <div
                key={i}
                style={{ left: `${leftPercent}%` }}
                title={`${ch.title} (${formatClock(ch.start)})`}
                className="pointer-events-none absolute top-1/2 -translate-y-1/2 h-2.5 w-0.5 bg-zinc-400/80 z-20"
              />
            );
          })}

        {duration > 0 &&
          bookmarks.map((b) => {
            const leftPercent = (b.time / duration) * 100;
            return (
              <div
                key={b.id}
                style={{ left: `${leftPercent}%` }}
                title={`Marcador: ${b.note || 'Sem nota'} (${formatClock(b.time)})`}
                className="pointer-events-none absolute top-1/2 -translate-y-1/2 h-3.5 w-1 bg-amber-400 z-20 rounded-full"
              />
            );
          })}
      </div>

      <div className="flex items-center gap-0.5 sm:gap-1 text-zinc-200 text-xs overflow-x-auto no-scrollbar">
        <button
          id="btn-play"
          type="button"
          onClick={onTogglePlay}
          aria-label={playing ? t.controls.pause : t.controls.play}
          className="rounded p-1 sm:p-1.5 hover:bg-white/10 shrink-0"
          title={`${playing ? t.controls.pause : t.controls.play} (Espaço)`}
        >
          {playing ? <Pause size={17} fill="currentColor" /> : <Play size={17} fill="currentColor" />}
        </button>

        <button
          type="button"
          onClick={() => onStepFrame(-1)}
          aria-label={t.controls.previousFrame}
          className="hidden sm:inline-flex rounded p-1 text-zinc-400 hover:bg-white/10 hover:text-white shrink-0"
          title={`${t.controls.previousFrame} (,)`}
        >
          <ChevronLeft size={16} />
        </button>
        <button
          type="button"
          onClick={() => onStepFrame(1)}
          aria-label={t.controls.nextFrame}
          className="hidden sm:inline-flex rounded p-1 text-zinc-400 hover:bg-white/10 hover:text-white shrink-0"
          title={`${t.controls.nextFrame} (.)`}
        >
          <ChevronRight size={16} />
        </button>

        <button
          id="btn-back"
          type="button"
          onClick={() => onSeekBy(-10)}
          aria-label={t.controls.rewind}
          className="rounded p-1 sm:p-1.5 hover:bg-white/10 shrink-0"
          title={`${t.controls.rewind} (J)`}
        >
          <RotateCcw size={15} />
        </button>
        <button
          id="btn-forward"
          type="button"
          onClick={() => onSeekBy(10)}
          aria-label={t.controls.forward}
          className="rounded p-1 sm:p-1.5 hover:bg-white/10 shrink-0"
          title={`${t.controls.forward} (L)`}
        >
          <RotateCw size={15} />
        </button>

        <div className="group/vol flex items-center shrink-0">
          <button
            id="btn-mute"
            type="button"
            onClick={onToggleMute}
            aria-label={muted ? t.controls.unmute : t.controls.mute}
            className="rounded p-1 sm:p-1.5 hover:bg-white/10 shrink-0"
            title={`${muted ? t.controls.unmute : t.controls.mute} (M)`}
          >
            <VolIcon size={16} />
          </button>
          <input
            id="volume-bar"
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={muted ? 0 : volume}
            aria-label={t.controls.volume}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round((muted ? 0 : volume) * 100)}
            style={{ ['--fill' as string]: `${(muted ? 0 : volume) * 100}%` }}
            onChange={(e) => onChangeVolume(parseFloat(e.target.value))}
            className="hidden sm:inline-block w-0 opacity-0 transition-all duration-200 group-hover/vol:w-16 group-hover/vol:opacity-100"
          />
        </div>

        <span className="ml-1 sm:ml-2 font-mono text-[10px] sm:text-[11px] text-zinc-400 shrink-0 whitespace-nowrap">
          {formatClock(time)} / {formatClock(duration)}
        </span>

        <div className="flex-1" />

        <div className="hidden md:flex items-center gap-0.5 rounded border border-zinc-800/80 bg-zinc-950/60 p-0.5 shrink-0">
          <button
            type="button"
            onClick={onSetLoopA}
            className={`rounded px-1.5 py-0.5 text-[10px] font-mono transition ${
              loopAB.start !== null ? 'bg-zinc-100 text-zinc-950 font-bold' : 'text-zinc-400 hover:text-white'
            }`}
            title="Definir ponto de início do Loop (A)"
          >
            A{loopAB.start !== null ? ` ${formatClock(loopAB.start)}` : ''}
          </button>
          <button
            type="button"
            onClick={onSetLoopB}
            className={`rounded px-1.5 py-0.5 text-[10px] font-mono transition ${
              loopAB.end !== null ? 'bg-zinc-100 text-zinc-950 font-bold' : 'text-zinc-400 hover:text-white'
            }`}
            title="Definir ponto de fim do Loop (B)"
          >
            B{loopAB.end !== null ? ` ${formatClock(loopAB.end)}` : ''}
          </button>
          {loopAB.enabled && (
            <button
              type="button"
              onClick={onClearLoopAB}
              className="rounded px-1 py-0.5 text-[10px] text-red-400 hover:text-red-300"
              title="Limpar Loop A-B"
            >
              X
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => onAddBookmark(time)}
          aria-label={t.controls.addBookmark}
          className="hidden sm:inline-flex rounded p-1.5 text-zinc-300 hover:bg-white/10 hover:text-white shrink-0"
          title={`${t.controls.addBookmark} (B)`}
        >
          <BookmarkPlus size={15} />
        </button>

        <div className="hidden md:flex items-center shrink-0">
          <button
            type="button"
            onClick={() => onAdjustZoom(-0.25)}
            className="rounded p-1 text-zinc-400 hover:text-white"
            title="Diminuir Zoom"
          >
            <ZoomOut size={14} />
          </button>
          <button
            type="button"
            onClick={() => onAdjustZoom(0.25)}
            className="rounded p-1 text-zinc-400 hover:text-white"
            title="Aumentar Zoom / Lupa"
          >
            <ZoomIn size={14} />
          </button>
        </div>

        <SpeedMenu
          currentSpeed={playbackSpeed}
          isOpen={speedMenuOpen}
          onToggle={onToggleSpeedMenu}
          onSelectSpeed={onSelectSpeed}
        />

        <button
          id="btn-screenshot"
          type="button"
          onClick={onCaptureScreenshot}
          aria-label={t.controls.screenshot}
          className="hidden sm:inline-flex rounded p-1.5 text-zinc-300 hover:bg-white/10 hover:text-white shrink-0"
          title={`${t.controls.screenshot} (S)`}
        >
          <Camera size={15} />
        </button>

        <button
          id="btn-pip"
          type="button"
          onClick={onTogglePiP}
          aria-label={t.controls.pip}
          className="hidden sm:inline-flex rounded p-1.5 text-zinc-300 hover:bg-white/10 hover:text-white shrink-0"
          title={`${t.controls.pip} (P)`}
        >
          <PictureInPicture2 size={15} />
        </button>

        <button
          id="btn-loop"
          type="button"
          onClick={onToggleLoop}
          aria-label={t.controls.loop}
          className={`hidden sm:inline-flex rounded p-1.5 hover:bg-white/10 transition shrink-0 ${
            loop ? 'text-zinc-100 bg-white/10' : 'text-zinc-400'
          }`}
          title={t.controls.loop}
        >
          <Repeat size={15} />
        </button>

        <button
          id="btn-subtitles"
          type="button"
          onClick={onToggleSubtitles}
          disabled={!cuesCount}
          aria-label={subtitlesOn ? t.controls.subtitlesOff : t.controls.subtitlesOn}
          className={`rounded p-1 sm:p-1.5 hover:bg-white/10 disabled:opacity-30 shrink-0 ${
            subtitlesOn && cuesCount ? 'text-zinc-100' : 'text-zinc-400'
          }`}
          title={`${subtitlesOn ? t.controls.subtitlesOff : t.controls.subtitlesOn} (C)`}
        >
          {subtitlesOn ? <Captions size={16} /> : <CaptionsOff size={16} />}
        </button>

        {onOpenExportModal && (
          <button
            id="btn-export-video"
            type="button"
            onClick={onOpenExportModal}
            aria-label={t.export.title}
            className="rounded p-1 sm:p-1.5 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300 transition shrink-0"
            title={t.export.button}
          >
            <Download size={15} />
          </button>
        )}

        <button
          id="btn-fullscreen"
          type="button"
          onClick={onToggleFullscreen}
          aria-label={fullscreen ? t.controls.exitFullscreen : t.controls.fullscreen}
          className="rounded p-1 sm:p-1.5 hover:bg-white/10 shrink-0"
          title={`${fullscreen ? t.controls.exitFullscreen : t.controls.fullscreen} (F)`}
        >
          {fullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
        </button>
      </div>
    </div>
  );
};
