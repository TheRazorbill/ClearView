import React from 'react';
import { Captions, Play, RotateCcw, Save } from 'lucide-react';
import {
  DEFAULT_SUBTITLE_CONFIG,
  SubtitleBg,
  SubtitleConfig,
  SubtitlePosition,
  SubtitleSize,
} from '../../../types/playerSettings';
import { Cue, formatClock } from '../../../utils/subtitles';
import { useTranslation } from '../../../i18n/I18nContext';

interface SubtitlesTabProps {
  subtitleConfig: SubtitleConfig;
  onChangeSubtitleConfig: <K extends keyof SubtitleConfig>(k: K, v: SubtitleConfig[K]) => void;
  onResetSubtitleConfig: () => void;
  cues: Cue[];
  currentTime?: number;
  onSeek?: (t: number) => void;
  onUpdateCues: (cues: Cue[]) => void;
  onSaveSubtitles?: () => void;
}

export default function SubtitlesTab({
  subtitleConfig,
  onChangeSubtitleConfig,
  onResetSubtitleConfig,
  cues,
  currentTime = 0,
  onSeek = () => {},
  onUpdateCues,
  onSaveSubtitles,
}: SubtitlesTabProps) {
  const { t } = useTranslation();

  const handleCueTextChange = (idx: number, newText: string) => {
    const updated = [...cues];
    updated[idx] = { ...updated[idx], text: newText };
    onUpdateCues(updated);
  };

  const getPreviewSizeClass = () => {
    switch (subtitleConfig.size) {
      case 'small':
        return 'text-xs';
      case 'large':
        return 'text-base';
      case 'xlarge':
        return 'text-lg';
      case 'medium':
      default:
        return 'text-sm';
    }
  };

  const getPreviewBgClass = () => {
    switch (subtitleConfig.bg) {
      case 'solid':
        return 'bg-black text-white';
      case 'none':
        return 'bg-transparent text-white [text-shadow:0_1px_2px_#000,0_2px_4px_#000]';
      case 'translucent':
      default:
        return 'bg-black/75 text-white';
    }
  };

  return (
    <div
      className="space-y-4 animate-fade-up"
      role="tabpanel"
      id="panel-subtitles"
      aria-labelledby="tab-subtitles"
    >
      {/* Subtitle Sizing */}
      <div className="rounded-md border border-zinc-900 bg-zinc-950/60 p-3 space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-200">
          <Captions size={13} className="text-zinc-400" />
          <span>{t.inspector.subtitles.fontSize}</span>
        </div>
        <div className="grid grid-cols-4 gap-1.5 text-xs">
          {[
            { id: 'small' as SubtitleSize, label: t.inspector.subtitles.fontSmall },
            { id: 'medium' as SubtitleSize, label: t.inspector.subtitles.fontMedium },
            { id: 'large' as SubtitleSize, label: t.inspector.subtitles.fontLarge },
            { id: 'xlarge' as SubtitleSize, label: t.inspector.subtitles.fontXlarge },
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => onChangeSubtitleConfig('size', s.id)}
              className={`rounded border px-1.5 py-1.5 text-center text-[10px] font-medium transition ${
                subtitleConfig.size === s.id
                  ? 'border-zinc-700 bg-zinc-100 text-zinc-950 font-semibold'
                  : 'border-zinc-900 bg-zinc-900/60 text-zinc-400 hover:border-zinc-800 hover:text-zinc-200'
              }`}
            >
              {s.id.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Subtitle Background */}
      <div className="rounded-md border border-zinc-900 bg-zinc-950/60 p-3 space-y-2">
        <span className="text-xs font-semibold text-zinc-200">
          {t.inspector.subtitles.background}
        </span>
        <div className="grid grid-cols-3 gap-1.5 text-xs">
          {[
            { id: 'translucent' as SubtitleBg, label: 'Translucido' },
            { id: 'solid' as SubtitleBg, label: 'Solido' },
            { id: 'none' as SubtitleBg, label: 'Sem fundo' },
          ].map((b) => (
            <button
              key={b.id}
              onClick={() => onChangeSubtitleConfig('bg', b.id)}
              className={`rounded border px-2 py-1.5 text-center text-[11px] font-medium transition ${
                subtitleConfig.bg === b.id
                  ? 'border-zinc-700 bg-zinc-100 text-zinc-950 font-semibold'
                  : 'border-zinc-900 bg-zinc-900/60 text-zinc-400 hover:border-zinc-800 hover:text-zinc-200'
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>

      {/* Subtitle Position */}
      <div className="rounded-md border border-zinc-900 bg-zinc-950/60 p-3 space-y-2">
        <span className="text-xs font-semibold text-zinc-200">
          {t.inspector.subtitles.position}
        </span>
        <div className="grid grid-cols-2 gap-1.5 text-xs">
          {[
            { id: 'bottom' as SubtitlePosition, label: t.inspector.subtitles.posBottom },
            { id: 'top' as SubtitlePosition, label: t.inspector.subtitles.posTop },
          ].map((p) => (
            <button
              key={p.id}
              onClick={() => onChangeSubtitleConfig('position', p.id)}
              className={`rounded border px-2 py-1.5 text-center text-[11px] font-medium transition ${
                subtitleConfig.position === p.id
                  ? 'border-zinc-700 bg-zinc-100 text-zinc-950 font-semibold'
                  : 'border-zinc-900 bg-zinc-900/60 text-zinc-400 hover:border-zinc-800 hover:text-zinc-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Live Preview Box */}
      <div className="relative flex h-24 items-center justify-center overflow-hidden rounded-md border border-zinc-900 bg-zinc-950">
        <span
          className={`rounded px-3 py-1 font-sans transition-all text-center max-w-[90%] ${getPreviewSizeClass()} ${getPreviewBgClass()}`}
        >
          Exemplo de exibicao de legenda estilizada
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={onResetSubtitleConfig}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-zinc-900 bg-zinc-950/60 py-2 text-xs font-semibold text-zinc-400 hover:border-zinc-800 hover:text-zinc-200 transition"
        >
          <RotateCcw size={12} />
          <span>{t.inspector.subtitles.resetSettings}</span>
        </button>

        {onSaveSubtitles && (
          <button
            onClick={onSaveSubtitles}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-900 py-2 text-xs font-semibold text-zinc-200 hover:border-zinc-700 hover:text-white transition active:scale-98"
          >
            <Save size={13} />
            <span>{t.inspector.subtitles.saveSettings}</span>
          </button>
        )}
      </div>

      {/* Editable Cues Section */}
      <div className="space-y-2 pt-2 border-t border-zinc-900">
        <span className="text-xs font-semibold text-zinc-300">
          Editor de Falas e Legendas ({cues.length})
        </span>
        {cues.length === 0 ? (
          <p className="p-4 text-center text-xs text-zinc-500">
            {t.inspector.subtitles.noSubtitlesLoaded}
          </p>
        ) : (
          <div className="max-h-60 overflow-y-auto space-y-2 scrollbar-thin">
            {cues.map((c, i) => (
              <div
                key={i}
                className="rounded-md border border-zinc-900 bg-zinc-950/80 p-2 space-y-1.5 focus-within:border-zinc-700"
              >
                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
                  <span>
                    #{i + 1} · {formatClock(c.start)} - {formatClock(c.end)}
                  </span>
                  <button
                    onClick={() => onSeek(c.start)}
                    className="flex items-center gap-1 text-zinc-400 hover:text-zinc-200 transition"
                    title="Pular para este momento no video"
                  >
                    <Play size={10} />
                    <span>Pular</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={c.text}
                  onChange={(e) => handleCueTextChange(i, e.target.value)}
                  className="w-full rounded bg-zinc-900/60 border border-zinc-850 px-2 py-1 text-xs text-zinc-200 outline-none focus:border-zinc-700"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
