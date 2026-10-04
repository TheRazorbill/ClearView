import React from 'react';
import { Save, Sliders, Volume2, Waves, Zap } from 'lucide-react';
import {
  AudioSettings,
  EqualizerBands,
  PRESETS,
  PresetId,
} from '../../../hooks/useVideoAudioEnhancer';
import { ChannelMode } from '../../../types/playerSettings';
import AudioVisualizer from '../../AudioVisualizer';
import CompactSlider from '../CompactSlider';
import { useTranslation } from '../../../i18n/I18nContext';

interface AudioTabProps {
  audioSettings: AudioSettings;
  activeAudioPreset: PresetId | null;
  onChangeAudio: <K extends keyof AudioSettings>(k: K, v: AudioSettings[K]) => void;
  onPresetAudio: (id: PresetId) => void;
  audioError: string | null;
  analyser: AnalyserNode | null;
  onSaveAudio?: () => void;
}

export default function AudioTab({
  audioSettings,
  activeAudioPreset,
  onChangeAudio,
  onPresetAudio,
  audioError,
  analyser,
  onSaveAudio,
}: AudioTabProps) {
  const { t } = useTranslation();

  const updateEq = <K extends keyof EqualizerBands>(band: K, val: number) => {
    onChangeAudio('equalizer', { ...audioSettings.equalizer, [band]: val });
  };

  return (
    <div
      className="space-y-4 animate-fade-up"
      role="tabpanel"
      id="panel-audio"
      aria-labelledby="tab-audio"
    >
      {audioError && (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 p-2.5 text-xs text-red-300">
          {audioError}
        </div>
      )}

      {/* Real-time Spectrum Visualizer */}
      <AudioVisualizer analyser={analyser} isActive={true} />

      {/* Channel Mode / Single Earphone Fix */}
      <div className="rounded-md border border-zinc-900 bg-zinc-950/60 p-3 space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-200">
          <Waves size={13} className="text-zinc-400" />
          <span>{t.inspector.audio.channelMode}</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5 text-xs">
          {[
            { id: 'stereo' as ChannelMode, label: t.inspector.audio.stereo },
            { id: 'mono' as ChannelMode, label: t.inspector.audio.mono },
            { id: 'left-only' as ChannelMode, label: t.inspector.audio.leftOnly },
            { id: 'right-only' as ChannelMode, label: t.inspector.audio.rightOnly },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => onChangeAudio('channelMode', mode.id)}
              className={`rounded border px-2.5 py-1.5 text-left text-[11px] font-medium transition ${
                audioSettings.channelMode === mode.id
                  ? 'border-zinc-700 bg-zinc-100 text-zinc-950 font-semibold'
                  : 'border-zinc-900 bg-zinc-900/60 text-zinc-400 hover:border-zinc-800 hover:text-zinc-200'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Audio Presets */}
      <div className="rounded-md border border-zinc-900 bg-zinc-950/60 p-3 space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-200">
          <Zap size={13} className="text-zinc-400" />
          <span>{t.inspector.audio.presets}</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5 text-xs">
          {(Object.keys(PRESETS) as PresetId[]).map((id) => {
            const p = PRESETS[id];
            return (
              <button
                key={id}
                onClick={() => onPresetAudio(id)}
                className={`rounded border px-2.5 py-1.5 text-left transition ${
                  activeAudioPreset === id
                    ? 'border-zinc-700 bg-zinc-100 text-zinc-950 font-semibold'
                    : 'border-zinc-900 bg-zinc-900/60 text-zinc-400 hover:border-zinc-800 hover:text-zinc-200'
                }`}
              >
                <div className="text-[11px] font-medium">{p.label}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Primary DSP Controls */}
      <div className="space-y-2.5">
        <CompactSlider
          label={t.inspector.audio.highPass}
          value={audioSettings.highPassFreq}
          min={20}
          max={250}
          step={5}
          format={(v) => (v === 20 ? 'Off' : `${v} Hz`)}
          onChange={(v) => onChangeAudio('highPassFreq', v)}
          onReset={() => onChangeAudio('highPassFreq', 20)}
          defaultValue={20}
        />

        <CompactSlider
          label={t.inspector.audio.lowPass}
          value={audioSettings.lowPassFreq}
          min={4000}
          max={20000}
          step={200}
          format={(v) => (v >= 19900 ? 'Off' : `${(v / 1000).toFixed(1)} kHz`)}
          onChange={(v) => onChangeAudio('lowPassFreq', v)}
          onReset={() => onChangeAudio('lowPassFreq', 20000)}
          defaultValue={20000}
        />

        <CompactSlider
          label={t.inspector.audio.notch}
          value={audioSettings.notchFreq}
          min={0}
          max={60}
          step={10}
          format={(v) => (v === 0 ? 'Off' : `${v} Hz`)}
          onChange={(v) => onChangeAudio('notchFreq', v)}
          onReset={() => onChangeAudio('notchFreq', 0)}
          defaultValue={0}
        />

        <CompactSlider
          label={t.inspector.audio.speechBoost}
          value={audioSettings.speechBoost}
          min={0}
          max={12}
          step={0.5}
          format={(v) => (v === 0 ? 'Off' : `+${v} dB`)}
          onChange={(v) => onChangeAudio('speechBoost', v)}
          onReset={() => onChangeAudio('speechBoost', 0)}
          defaultValue={0}
        />

        <CompactSlider
          label={t.inspector.audio.volumeGain}
          value={audioSettings.volume}
          min={0}
          max={3}
          step={0.05}
          format={(v) => `${Math.round(v * 100)}%`}
          onChange={(v) => onChangeAudio('volume', v)}
          onReset={() => onChangeAudio('volume', 1)}
          defaultValue={1}
        />

        {/* Noise Gate Switch & Threshold */}
        <div className="rounded-md border border-zinc-900 bg-zinc-950/60 p-2.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-300">{t.inspector.audio.noiseGate}</span>
            <button
              onClick={() => onChangeAudio('noiseGate', !audioSettings.noiseGate)}
              className={`rounded px-2 py-0.5 text-[10px] font-semibold transition ${
                audioSettings.noiseGate
                  ? 'bg-zinc-100 text-zinc-950'
                  : 'bg-zinc-900 text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {audioSettings.noiseGate ? 'ATIVADO' : 'DESLIGADO'}
            </button>
          </div>
          {audioSettings.noiseGate && (
            <CompactSlider
              label={t.inspector.audio.threshold}
              value={audioSettings.gateThreshold}
              min={-60}
              max={-20}
              step={1}
              format={(v) => `${v} dB`}
              onChange={(v) => onChangeAudio('gateThreshold', v)}
              onReset={() => onChangeAudio('gateThreshold', -42)}
              defaultValue={-42}
            />
          )}
        </div>
      </div>

      {/* 5-Band Graphic Equalizer */}
      <div className="rounded-md border border-zinc-900 bg-zinc-950/60 p-3 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-200">
            <Sliders size={13} className="text-zinc-400" />
            <span>{t.inspector.audio.equalizer}</span>
          </div>
        </div>
        <div className="grid grid-cols-5 gap-1.5 pt-1 text-center">
          {[
            { key: 'sub60' as const, label: '60 Hz' },
            { key: 'low250' as const, label: '250 Hz' },
            { key: 'mid1k' as const, label: '1 kHz' },
            { key: 'pres4k' as const, label: '4 kHz' },
            { key: 'high12k' as const, label: '12 kHz' },
          ].map((b) => (
            <div key={b.key} className="space-y-1.5">
              <span className="font-mono text-[10px] text-zinc-400">
                {audioSettings.equalizer[b.key] > 0
                  ? `+${audioSettings.equalizer[b.key]}`
                  : audioSettings.equalizer[b.key]}
              </span>
              <input
                type="range"
                min={-12}
                max={12}
                step={1}
                value={audioSettings.equalizer[b.key]}
                aria-label={`Equalizador ${b.label}`}
                style={{
                  ['--fill' as string]: `${((audioSettings.equalizer[b.key] + 12) / 24) * 100}%`,
                }}
                onChange={(e) => updateEq(b.key, parseFloat(e.target.value))}
                className="w-full cursor-pointer"
              />
              <span className="block text-[10px] text-zinc-500">{b.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Save Audio Button */}
      {onSaveAudio && (
        <button
          onClick={onSaveAudio}
          className="flex w-full items-center justify-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-900 py-2 text-xs font-semibold text-zinc-200 hover:border-zinc-700 hover:text-white transition active:scale-98"
        >
          <Save size={13} />
          <span>{t.inspector.audio.saveSettings}</span>
        </button>
      )}
    </div>
  );
}
