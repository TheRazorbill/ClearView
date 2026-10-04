import React from 'react';
import { RotateCcw, Save, SunMedium, Zap } from 'lucide-react';
import {
  AspectRatioMode,
  DEFAULT_VIDEO_FILTERS,
  VIDEO_PRESETS,
  VideoFilterPresetId,
  VideoFilters,
} from '../../../types/playerSettings';
import CompactSlider from '../CompactSlider';
import { useTranslation } from '../../../i18n/I18nContext';

interface VideoTabProps {
  videoFilters: VideoFilters;
  onChangeVideoFilter: <K extends keyof VideoFilters>(k: K, v: VideoFilters[K]) => void;
  onResetVideoFilters: () => void;
  onApplyVideoPreset: (id: VideoFilterPresetId) => void;
  aspectRatio: AspectRatioMode;
  onChangeAspectRatio: (mode: AspectRatioMode) => void;
  onSaveVideo?: () => void;
}

export default function VideoTab({
  videoFilters,
  onChangeVideoFilter,
  onResetVideoFilters,
  onApplyVideoPreset,
  aspectRatio,
  onChangeAspectRatio,
  onSaveVideo,
}: VideoTabProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4 animate-fade-up" role="tabpanel" id="panel-video" aria-labelledby="tab-video">
      {/* Visual Presets */}
      <div className="rounded-md border border-zinc-900 bg-zinc-950/60 p-3 space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-200">
          <Zap size={13} className="text-zinc-400" />
          <span>{t.inspector.video.presets}</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5 text-xs">
          {(Object.keys(VIDEO_PRESETS) as VideoFilterPresetId[]).map((id) => {
            const p = VIDEO_PRESETS[id];
            return (
              <button
                key={id}
                onClick={() => onApplyVideoPreset(id)}
                className="rounded border border-zinc-900 bg-zinc-900/60 px-2.5 py-1.5 text-left text-[11px] font-medium text-zinc-400 hover:border-zinc-800 hover:text-zinc-200 transition"
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Aspect Ratio Selector */}
      <div className="rounded-md border border-zinc-900 bg-zinc-950/60 p-3 space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-200">
          <SunMedium size={13} className="text-zinc-400" />
          <span>{t.inspector.video.aspectRatio}</span>
        </div>
        <div className="grid grid-cols-3 gap-1.5 text-xs">
          {(['contain', 'cover', 'fill', '16/9', '4/3'] as AspectRatioMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => onChangeAspectRatio(mode)}
              className={`rounded border px-2 py-1.5 text-center text-[11px] font-medium transition ${
                aspectRatio === mode
                  ? 'border-zinc-700 bg-zinc-100 text-zinc-950 font-semibold'
                  : 'border-zinc-900 bg-zinc-900/60 text-zinc-400 hover:border-zinc-800 hover:text-zinc-200'
              }`}
            >
              {mode === 'contain' ? 'Conter' : mode === 'cover' ? 'Cobrir' : mode === 'fill' ? 'Preencher' : mode}
            </button>
          ))}
        </div>
      </div>

      {/* Color Calibration Sliders */}
      <div className="space-y-2.5">
        <CompactSlider
          label={t.inspector.video.brightness}
          value={videoFilters.brightness}
          min={50}
          max={200}
          step={5}
          format={(v) => `${v}%`}
          onChange={(v) => onChangeVideoFilter('brightness', v)}
          onReset={() => onChangeVideoFilter('brightness', DEFAULT_VIDEO_FILTERS.brightness)}
          defaultValue={DEFAULT_VIDEO_FILTERS.brightness}
        />

        <CompactSlider
          label={t.inspector.video.contrast}
          value={videoFilters.contrast}
          min={50}
          max={200}
          step={5}
          format={(v) => `${v}%`}
          onChange={(v) => onChangeVideoFilter('contrast', v)}
          onReset={() => onChangeVideoFilter('contrast', DEFAULT_VIDEO_FILTERS.contrast)}
          defaultValue={DEFAULT_VIDEO_FILTERS.contrast}
        />

        <CompactSlider
          label={t.inspector.video.saturation}
          value={videoFilters.saturate}
          min={0}
          max={250}
          step={5}
          format={(v) => `${v}%`}
          onChange={(v) => onChangeVideoFilter('saturate', v)}
          onReset={() => onChangeVideoFilter('saturate', DEFAULT_VIDEO_FILTERS.saturate)}
          defaultValue={DEFAULT_VIDEO_FILTERS.saturate}
        />

        <CompactSlider
          label={t.inspector.video.sepia}
          value={videoFilters.sepia}
          min={0}
          max={100}
          step={5}
          format={(v) => `${v}%`}
          onChange={(v) => onChangeVideoFilter('sepia', v)}
          onReset={() => onChangeVideoFilter('sepia', 0)}
          defaultValue={0}
        />

        <CompactSlider
          label={t.inspector.video.grayscale}
          value={videoFilters.grayscale}
          min={0}
          max={100}
          step={5}
          format={(v) => `${v}%`}
          onChange={(v) => onChangeVideoFilter('grayscale', v)}
          onReset={() => onChangeVideoFilter('grayscale', 0)}
          defaultValue={0}
        />

        <CompactSlider
          label={t.inspector.video.invert}
          value={videoFilters.invert}
          min={0}
          max={100}
          step={5}
          format={(v) => `${v}%`}
          onChange={(v) => onChangeVideoFilter('invert', v)}
          onReset={() => onChangeVideoFilter('invert', 0)}
          defaultValue={0}
        />

        <CompactSlider
          label={t.inspector.video.blur}
          value={videoFilters.blur}
          min={0}
          max={10}
          step={0.5}
          format={(v) => `${v}px`}
          onChange={(v) => onChangeVideoFilter('blur', v)}
          onReset={() => onChangeVideoFilter('blur', 0)}
          defaultValue={0}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={onResetVideoFilters}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-zinc-900 bg-zinc-950/60 py-2 text-xs font-semibold text-zinc-400 hover:border-zinc-800 hover:text-zinc-200 transition"
        >
          <RotateCcw size={12} />
          <span>{t.inspector.video.resetAll}</span>
        </button>

        {onSaveVideo && (
          <button
            onClick={onSaveVideo}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-900 py-2 text-xs font-semibold text-zinc-200 hover:border-zinc-700 hover:text-white transition active:scale-98"
          >
            <Save size={13} />
            <span>{t.inspector.video.saveSettings}</span>
          </button>
        )}
      </div>
    </div>
  );
}
