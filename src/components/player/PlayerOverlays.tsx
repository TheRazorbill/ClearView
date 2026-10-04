import React from 'react';
import { Play } from 'lucide-react';
import { Cue, formatClock } from '../../utils/subtitles';
import { SubtitleConfig } from '../../types/playerSettings';
import { useTranslation } from '../../i18n/I18nContext';

interface PlayerOverlaysProps {
  activeCue?: Cue;
  subtitleConfig: SubtitleConfig;
  hideUi: boolean;
  resumeTime: number | null;
  onResume: () => void;
  onDismissResume: () => void;
  flash: string | null;
  zoomScale: number;
  onResetZoom: () => void;
  playing: boolean;
  onTogglePlay: () => void;
  dragSub: boolean;
}

export const PlayerOverlays: React.FC<PlayerOverlaysProps> = ({
  activeCue,
  subtitleConfig,
  hideUi,
  resumeTime,
  onResume,
  onDismissResume,
  flash,
  zoomScale,
  onResetZoom,
  playing,
  onTogglePlay,
  dragSub,
}) => {
  const { t } = useTranslation();
  const isSubTop = subtitleConfig.position === 'top';

  const getSubtitleSizeClass = () => {
    switch (subtitleConfig.size) {
      case 'sm':
        return 'text-sm md:text-base px-3 py-1';
      case 'lg':
        return 'text-xl md:text-3xl px-5 py-2';
      case 'xl':
        return 'text-2xl md:text-4xl px-6 py-2.5';
      case 'base':
      default:
        return 'text-base md:text-2xl px-4 py-1.5';
    }
  };

  const getSubtitleBgClass = () => {
    switch (subtitleConfig.bg) {
      case 'solid':
        return 'bg-black text-white border border-zinc-800';
      case 'yellow':
        return 'bg-black/90 text-amber-300 font-medium border border-amber-500/20';
      case 'none':
        return 'bg-transparent text-white [text-shadow:0_1px_3px_#000,0_2px_8px_#000,0_0_15px_#000]';
      case 'translucent':
      default:
        return 'bg-black/75 text-white';
    }
  };

  return (
    <>
      {activeCue && (
        <div
          aria-live="polite"
          className={`pointer-events-none absolute inset-x-0 flex justify-center px-8 transition-all duration-300 z-30 ${
            isSubTop ? 'top-8' : hideUi ? 'bottom-8' : 'bottom-24'
          }`}
        >
          <span
            className={`max-w-3xl whitespace-pre-line rounded-md text-center font-sans leading-snug transition-all ${getSubtitleSizeClass()} ${getSubtitleBgClass()}`}
          >
            {activeCue.text}
          </span>
        </div>
      )}

      {resumeTime !== null && (
        <div className="absolute top-2.5 sm:top-4 left-2.5 right-2.5 sm:right-auto sm:left-4 z-40 flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3 rounded-md border border-zinc-800 bg-zinc-950/90 px-3 py-2 text-xs backdrop-blur animate-fade-up shadow-xl max-w-sm">
          <span className="text-zinc-300">
            {t.resume.prompt}{' '}
            <strong className="text-white">{formatClock(resumeTime)}</strong>?
          </span>
          <div className="flex items-center gap-2 ml-auto sm:ml-0">
            <button
              type="button"
              onClick={onResume}
              className="rounded bg-zinc-100 px-2.5 py-1 font-semibold text-zinc-950 hover:bg-white transition"
            >
              {t.resume.continue}
            </button>
            <button
              type="button"
              onClick={onDismissResume}
              className="text-zinc-500 hover:text-zinc-300 text-[11px]"
            >
              {t.resume.dismiss}
            </button>
          </div>
        </div>
      )}

      {flash && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-40">
          <span className="rounded-md bg-zinc-950/80 px-4 py-2 font-mono text-xs font-semibold tracking-wide text-zinc-100 border border-zinc-800 animate-fade-up">
            {flash}
          </span>
        </div>
      )}

      {zoomScale > 1 && (
        <div className="absolute top-4 right-4 z-40 flex items-center gap-2 rounded-md bg-zinc-950/80 px-2.5 py-1 text-xs border border-zinc-800">
          <span className="font-mono text-zinc-300">{Math.round(zoomScale * 100)}%</span>
          <button
            type="button"
            onClick={onResetZoom}
            className="text-zinc-400 hover:text-white"
            title="Redefinir zoom"
          >
            Reset
          </button>
        </div>
      )}

      {!playing && (
        <button
          id="big-play"
          type="button"
          onClick={onTogglePlay}
          aria-label={t.controls.play}
          className="absolute z-20 flex h-16 w-16 items-center justify-center rounded-md bg-zinc-100 text-zinc-950 transition active:scale-95 hover:bg-white shadow-2xl"
        >
          <Play size={26} fill="currentColor" className="ml-1" />
        </button>
      )}

      {dragSub && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center border-2 border-dashed border-zinc-400 bg-zinc-950/80 z-40">
          <p className="text-base font-medium text-zinc-200">
            Solte o arquivo .srt / .vtt para carregar legendas
          </p>
        </div>
      )}
    </>
  );
};
