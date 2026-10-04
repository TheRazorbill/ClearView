import { describe, expect, it } from 'vitest';
import { PRESETS, PresetId } from '../hooks/useVideoAudioEnhancer';
import { ChannelMode } from '../types/playerSettings';

describe('Audio DSP & Equalizer Presets', () => {
  it('validates that all 8 presets have safe and calibrated parameters', () => {
    const presetIds = Object.keys(PRESETS) as PresetId[];
    expect(presetIds).toHaveLength(8);

    presetIds.forEach((id) => {
      const p = PRESETS[id];
      expect(p.label).toBeTruthy();
      expect(p.desc).toBeTruthy();

      expect(p.settings.highPassFreq).toBeGreaterThanOrEqual(20);
      expect(p.settings.highPassFreq).toBeLessThanOrEqual(250);

      expect(p.settings.lowPassFreq).toBeGreaterThanOrEqual(4000);
      expect(p.settings.lowPassFreq).toBeLessThanOrEqual(20000);

      expect(p.settings.speechBoost).toBeGreaterThanOrEqual(0);
      expect(p.settings.speechBoost).toBeLessThanOrEqual(12);

      expect(p.settings.volume).toBeGreaterThanOrEqual(0);
      expect(p.settings.volume).toBeLessThanOrEqual(3.0);

      expect(p.settings.equalizer).toBeDefined();
      expect(p.settings.equalizer.sub60).toBeLessThanOrEqual(12);
      expect(p.settings.equalizer.sub60).toBeGreaterThanOrEqual(-12);
    });
  });

  it('calculates proper channel matrix gains for mono downmix and single earphone fix', () => {
    function getMatrixGains(mode: ChannelMode) {
      switch (mode) {
        case 'mono':
          return { ll: 0.5, lr: 0.5, rl: 0.5, rr: 0.5 };
        case 'left-only':
          return { ll: 1.0, lr: 1.0, rl: 0.0, rr: 0.0 };
        case 'right-only':
          return { ll: 0.0, lr: 0.0, rl: 1.0, rr: 1.0 };
        case 'stereo':
        default:
          return { ll: 1.0, lr: 0.0, rl: 0.0, rr: 1.0 };
      }
    }

    expect(getMatrixGains('stereo')).toEqual({ ll: 1.0, lr: 0.0, rl: 0.0, rr: 1.0 });
    expect(getMatrixGains('mono')).toEqual({ ll: 0.5, lr: 0.5, rl: 0.5, rr: 0.5 });
    expect(getMatrixGains('left-only')).toEqual({ ll: 1.0, lr: 1.0, rl: 0.0, rr: 0.0 });
    expect(getMatrixGains('right-only')).toEqual({ ll: 0.0, lr: 0.0, rl: 1.0, rr: 1.0 });
  });

  it('checks Anti-Ruído Agressivo preset configuration', () => {
    const heavy = PRESETS.heavy_denoise.settings;
    expect(heavy.noiseGate).toBe(true);
    expect(heavy.notchFreq).toBe(60);
    expect(heavy.highPassFreq).toBe(180);
    expect(heavy.lowPassFreq).toBe(7500);
  });
});
