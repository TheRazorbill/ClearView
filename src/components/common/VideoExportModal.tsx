import React from 'react';
import { Check, Download, Film, Loader2, Sparkles, Volume2, X } from 'lucide-react';
import { ExportOptions, ExportProgress } from '../../types/exportTypes';
import { useTranslation } from '../../i18n/I18nContext';
import { handleModalKeyDown } from '../../utils/a11y';

interface VideoExportModalProps {
  open: boolean;
  onClose: () => void;
  options: ExportOptions;
  setOptions: React.Dispatch<React.SetStateAction<ExportOptions>>;
  progress: ExportProgress;
  downloadUrl: string | null;
  onStartExport: () => void;
  onCancelExport: () => void;
  hasLoopAB: boolean;
  hasSubtitles: boolean;
}

export default function VideoExportModal({
  open,
  onClose,
  options,
  setOptions,
  progress,
  downloadUrl,
  onStartExport,
  onCancelExport,
  hasLoopAB,
  hasSubtitles,
}: VideoExportModalProps) {
  const { t } = useTranslation();

  if (!open) return null;

  const isRendering =
    progress.stage === 'rendering' ||
    progress.stage === 'preparing' ||
    progress.stage === 'encoding';
  const isDone = progress.stage === 'done' && downloadUrl;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs animate-fade-up"
      onClick={isRendering ? undefined : onClose}
      onKeyDown={(e) => !isRendering && handleModalKeyDown(e, onClose)}
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-modal-title"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-lg border border-zinc-800 bg-zinc-950 p-5 sm:p-6 shadow-2xl text-zinc-100 space-y-5"
      >
        <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
          <div className="flex items-center gap-2">
            <Film size={18} className="text-zinc-200" />
            <h2
              id="export-modal-title"
              className="text-base sm:text-lg font-semibold tracking-tight"
            >
              {t.exportModal.title}
            </h2>
          </div>
          {!isRendering && (
            <button
              onClick={onClose}
              className="rounded p-1 text-zinc-400 hover:bg-zinc-900 hover:text-white transition"
              aria-label={t.common.close}
            >
              <X size={16} />
            </button>
          )}
        </div>

        <p className="text-xs text-zinc-400 leading-relaxed">{t.exportModal.description}</p>

        {!isRendering && !isDone && (
          <div className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-zinc-300 uppercase tracking-wider text-[10px]">
                {t.exportModal.range}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setOptions((prev) => ({ ...prev, range: 'all' }))}
                  className={`rounded border p-2 text-left transition ${
                    options.range === 'all'
                      ? 'border-zinc-700 bg-zinc-100 text-zinc-950 font-semibold'
                      : 'border-zinc-900 bg-zinc-900/60 text-zinc-400 hover:border-zinc-800 hover:text-zinc-200'
                  }`}
                >
                  <div className="font-medium">{t.exportModal.entireVideo}</div>
                </button>

                <button
                  disabled={!hasLoopAB}
                  onClick={() => setOptions((prev) => ({ ...prev, range: 'loop' }))}
                  className={`rounded border p-2 text-left transition disabled:opacity-40 ${
                    options.range === 'loop'
                      ? 'border-zinc-700 bg-zinc-100 text-zinc-950 font-semibold'
                      : 'border-zinc-900 bg-zinc-900/60 text-zinc-400 hover:border-zinc-800 hover:text-zinc-200'
                  }`}
                >
                  <div className="font-medium">{t.exportModal.loopRangeOnly}</div>
                </button>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-zinc-900">
              <label
                onClick={() => setOptions((p) => ({ ...p, includeAudioFx: !p.includeAudioFx }))}
                className="flex items-start gap-3 rounded-md border border-zinc-900 bg-zinc-950/60 p-2.5 cursor-pointer hover:border-zinc-800 transition"
              >
                <input
                  type="checkbox"
                  checked={options.includeAudioFx}
                  onChange={() => {}}
                  className="mt-0.5 rounded border-zinc-700 text-zinc-100 cursor-pointer"
                />
                <div className="flex-1">
                  <div className="font-medium text-zinc-200 flex items-center gap-1.5">
                    <Volume2 size={13} className="text-zinc-400" />
                    <span>{t.exportModal.includeAudioFx}</span>
                  </div>
                  <p className="text-[11px] text-zinc-500">{t.exportModal.includeAudioFxDesc}</p>
                </div>
              </label>

              <label
                onClick={() => setOptions((p) => ({ ...p, includeVideoFx: !p.includeVideoFx }))}
                className="flex items-start gap-3 rounded-md border border-zinc-900 bg-zinc-950/60 p-2.5 cursor-pointer hover:border-zinc-800 transition"
              >
                <input
                  type="checkbox"
                  checked={options.includeVideoFx}
                  onChange={() => {}}
                  className="mt-0.5 rounded border-zinc-700 text-zinc-100 cursor-pointer"
                />
                <div className="flex-1">
                  <div className="font-medium text-zinc-200 flex items-center gap-1.5">
                    <Sparkles size={13} className="text-zinc-400" />
                    <span>{t.exportModal.includeVideoFx}</span>
                  </div>
                  <p className="text-[11px] text-zinc-500">{t.exportModal.includeVideoFxDesc}</p>
                </div>
              </label>

              <label
                onClick={() => {
                  if (hasSubtitles) {
                    setOptions((p) => ({ ...p, includeSubtitles: !p.includeSubtitles }));
                  }
                }}
                className={`flex items-start gap-3 rounded-md border border-zinc-900 bg-zinc-950/60 p-2.5 ${
                  hasSubtitles
                    ? 'cursor-pointer hover:border-zinc-800'
                    : 'opacity-40 cursor-not-allowed'
                } transition`}
              >
                <input
                  type="checkbox"
                  disabled={!hasSubtitles}
                  checked={options.includeSubtitles && hasSubtitles}
                  onChange={() => {}}
                  className="mt-0.5 rounded border-zinc-700 text-zinc-100 cursor-pointer"
                />
                <div className="flex-1">
                  <div className="font-medium text-zinc-200 flex items-center gap-1.5">
                    <Film size={13} className="text-zinc-400" />
                    <span>{t.exportModal.includeSubtitles}</span>
                  </div>
                  <p className="text-[11px] text-zinc-500">{t.exportModal.includeSubtitlesDesc}</p>
                </div>
              </label>
            </div>
          </div>
        )}

        {isRendering && (
          <div className="space-y-3 py-4 text-xs">
            <div className="flex items-center justify-between text-zinc-300">
              <span className="flex items-center gap-2">
                <Loader2 size={14} className="animate-spin text-zinc-100" />
                <span>
                  {progress.stage === 'preparing'
                    ? t.exportModal.processingFrames
                    : progress.stage === 'encoding'
                      ? t.exportModal.encodingAudio
                      : t.exportModal.rendering}
                </span>
              </span>
              <span className="font-mono font-semibold text-zinc-100">{progress.percent}%</span>
            </div>

            <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-900 border border-zinc-800">
              <div
                className="h-full bg-zinc-100 transition-all duration-200"
                style={{ width: `${progress.percent}%` }}
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={onCancelExport}
                className="rounded border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs text-red-300 hover:bg-red-500/20 transition"
              >
                {t.exportModal.cancel}
              </button>
            </div>
          </div>
        )}

        {isDone && (
          <div className="space-y-4 py-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 mx-auto border border-emerald-500/30">
              <Check size={24} />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-zinc-100">
                {t.exportModal.readyToDownload}
              </h3>
              <p className="text-xs text-zinc-400">
                O arquivo de video final foi gerado com sucesso.
              </p>
            </div>
            <a
              href={downloadUrl}
              download="video-editado.webm"
              className="inline-flex items-center gap-2 rounded-md bg-zinc-100 px-5 py-2.5 text-xs font-semibold text-zinc-950 hover:bg-white transition active:scale-95 shadow-lg"
            >
              <Download size={14} />
              <span>{t.exportModal.downloadVideo}</span>
            </a>
          </div>
        )}

        {!isRendering && !isDone && (
          <div className="flex justify-end gap-2 pt-2 border-t border-zinc-900">
            <button
              onClick={onClose}
              className="rounded-md px-4 py-2 text-xs font-medium text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 transition"
            >
              {t.exportModal.cancel}
            </button>
            <button
              onClick={onStartExport}
              className="flex items-center gap-1.5 rounded-md bg-zinc-100 px-4 py-2 text-xs font-semibold text-zinc-950 hover:bg-white transition active:scale-95"
            >
              <Film size={13} />
              <span>{t.exportModal.startExport}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export { VideoExportModal };
