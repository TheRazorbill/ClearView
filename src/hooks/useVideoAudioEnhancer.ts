import { RefObject, useCallback, useEffect, useRef, useState } from 'react';
import { ChannelMode, EqualizerBands } from '../types/playerSettings';
export type { EqualizerBands };

export interface AudioSettings {
  highPassFreq: number;
  lowPassFreq: number;
  notchFreq: number;
  speechBoost: number;
  speechFreq: number;
  compression: number;
  volume: number;
  noiseGate: boolean;
  gateThreshold: number;
  channelMode: ChannelMode;
  equalizer: EqualizerBands;
  smartSilenceSkip: boolean;
}

export type PresetId = 'flat' | 'denoise' | 'heavy_denoise' | 'dehiss' | 'hum60' | 'voice' | 'night' | 'studio';

export const DEFAULT_EQ: EqualizerBands = {
  sub60: 0,
  low250: 0,
  mid1k: 0,
  pres4k: 0,
  high12k: 0,
};

export const PRESETS: Record<PresetId, { label: string; desc: string; settings: AudioSettings }> = {
  flat: {
    label: 'Desativado (Flat)',
    desc: 'Áudio original sem nenhum filtro ou equalização.',
    settings: {
      highPassFreq: 20,
      lowPassFreq: 20000,
      notchFreq: 0,
      speechBoost: 0,
      speechFreq: 3000,
      compression: 0,
      volume: 1,
      noiseGate: false,
      gateThreshold: -45,
      channelMode: 'stereo',
      equalizer: { ...DEFAULT_EQ },
      smartSilenceSkip: false,
    },
  },
  denoise: {
    label: 'Limpar Ruído & Vento',
    desc: 'Corta vento, vibrações de mão e limpa chiados suaves.',
    settings: {
      highPassFreq: 140,
      lowPassFreq: 14000,
      notchFreq: 0,
      speechBoost: 3,
      speechFreq: 2800,
      compression: 0.35,
      volume: 1.2,
      noiseGate: true,
      gateThreshold: -48,
      channelMode: 'stereo',
      equalizer: { sub60: -4, low250: -2, mid1k: 1, pres4k: 3, high12k: -2 },
      smartSilenceSkip: false,
    },
  },
  heavy_denoise: {
    label: 'Anti-Ruído Agressivo (Gate + Filtros)',
    desc: 'Para vídeos de rua com muito barulho de fundo e ar-condicionado.',
    settings: {
      highPassFreq: 180,
      lowPassFreq: 7500,
      notchFreq: 60,
      speechBoost: 5,
      speechFreq: 3000,
      compression: 0.6,
      volume: 1.4,
      noiseGate: true,
      gateThreshold: -38,
      channelMode: 'stereo',
      equalizer: { sub60: -8, low250: -4, mid1k: 2, pres4k: 5, high12k: -6 },
      smartSilenceSkip: false,
    },
  },
  dehiss: {
    label: 'Eliminar Chiado / Hiss Agudo',
    desc: 'Filtro passa-baixas para gravações com chiado constante de microfone.',
    settings: {
      highPassFreq: 80,
      lowPassFreq: 6500,
      notchFreq: 0,
      speechBoost: 4,
      speechFreq: 2900,
      compression: 0.3,
      volume: 1.25,
      noiseGate: true,
      gateThreshold: -46,
      channelMode: 'stereo',
      equalizer: { sub60: 0, low250: 0, mid1k: 2, pres4k: 3, high12k: -10 },
      smartSilenceSkip: false,
    },
  },
  hum60: {
    label: 'Remover Zumbido de Rede (60Hz)',
    desc: 'Notch filter cirúrgico para interferência elétrica e aterramento.',
    settings: {
      highPassFreq: 100,
      lowPassFreq: 18000,
      notchFreq: 60,
      speechBoost: 2,
      speechFreq: 3000,
      compression: 0.2,
      volume: 1.15,
      noiseGate: false,
      gateThreshold: -50,
      channelMode: 'stereo',
      equalizer: { sub60: -6, low250: 0, mid1k: 0, pres4k: 0, high12k: 0 },
      smartSilenceSkip: false,
    },
  },
  voice: {
    label: 'Realçar Voz / Podcasts',
    desc: 'Traz a voz para o centro, com presença e inteligibilidade reforçada.',
    settings: {
      highPassFreq: 110,
      lowPassFreq: 16000,
      notchFreq: 0,
      speechBoost: 8,
      speechFreq: 3000,
      compression: 0.5,
      volume: 1.4,
      noiseGate: true,
      gateThreshold: -50,
      channelMode: 'stereo',
      equalizer: { sub60: -5, low250: 1, mid1k: 3, pres4k: 6, high12k: 1 },
      smartSilenceSkip: false,
    },
  },
  night: {
    label: 'Nivelador Noturno (Compressão Máxima)',
    desc: 'Achata explosões e eleva sussurros para assistir sem incomodar.',
    settings: {
      highPassFreq: 90,
      lowPassFreq: 15000,
      notchFreq: 0,
      speechBoost: 5,
      speechFreq: 3200,
      compression: 1.0,
      volume: 1.8,
      noiseGate: false,
      gateThreshold: -50,
      channelMode: 'stereo',
      equalizer: { sub60: -6, low250: -2, mid1k: 2, pres4k: 2, high12k: -2 },
      smartSilenceSkip: false,
    },
  },
  studio: {
    label: 'Estúdio Cristalino',
    desc: 'Cadeia completa: De-Hiss, Notch 60Hz, Gate silencioso e clareza vocal.',
    settings: {
      highPassFreq: 120,
      lowPassFreq: 9000,
      notchFreq: 60,
      speechBoost: 6,
      speechFreq: 3100,
      compression: 0.45,
      volume: 1.35,
      noiseGate: true,
      gateThreshold: -42,
      channelMode: 'stereo',
      equalizer: { sub60: -6, low250: 0, mid1k: 3, pres4k: 4, high12k: -4 },
      smartSilenceSkip: false,
    },
  },
};

interface MatrixNodes {
  splitter: ChannelSplitterNode;
  merger: ChannelMergerNode;
  gainLL: GainNode;
  gainLR: GainNode;
  gainRL: GainNode;
  gainRR: GainNode;
}

interface Nodes {
  ctx: AudioContext;
  matrix: MatrixNodes;
  highPass: BiquadFilterNode;
  notch: BiquadFilterNode;
  lowPass: BiquadFilterNode;
  eq60: BiquadFilterNode;
  eq250: BiquadFilterNode;
  eq1k: BiquadFilterNode;
  eq4k: BiquadFilterNode;
  eq12k: BiquadFilterNode;
  speech: BiquadFilterNode;
  compressor: DynamicsCompressorNode;
  gateGain: GainNode;
  analyser: AnalyserNode;
  userGain: GainNode;
  limiter: DynamicsCompressorNode;
}

const sourceCache = new WeakMap<HTMLMediaElement, { nodes: Nodes; rafId: { current: number } }>();

function applyToNodes(n: Nodes, s: AudioSettings) {
  const t = n.ctx.currentTime;
  const ramp = (p: AudioParam, v: number, speed = 0.03) => p.setTargetAtTime(v, t, speed);

  switch (s.channelMode) {
    case 'mono':
      ramp(n.matrix.gainLL.gain, 0.5);
      ramp(n.matrix.gainLR.gain, 0.5);
      ramp(n.matrix.gainRL.gain, 0.5);
      ramp(n.matrix.gainRR.gain, 0.5);
      break;
    case 'left-only':
      ramp(n.matrix.gainLL.gain, 1.0);
      ramp(n.matrix.gainLR.gain, 1.0);
      ramp(n.matrix.gainRL.gain, 0.0);
      ramp(n.matrix.gainRR.gain, 0.0);
      break;
    case 'right-only':
      ramp(n.matrix.gainLL.gain, 0.0);
      ramp(n.matrix.gainLR.gain, 0.0);
      ramp(n.matrix.gainRL.gain, 1.0);
      ramp(n.matrix.gainRR.gain, 1.0);
      break;
    case 'stereo':
    default:
      ramp(n.matrix.gainLL.gain, 1.0);
      ramp(n.matrix.gainLR.gain, 0.0);
      ramp(n.matrix.gainRL.gain, 0.0);
      ramp(n.matrix.gainRR.gain, 1.0);
      break;
  }

  ramp(n.highPass.frequency, s.highPassFreq);

  if (s.notchFreq > 0) {
    ramp(n.notch.frequency, s.notchFreq);
    ramp(n.notch.Q, 8.0);
  } else {
    ramp(n.notch.frequency, 10);
    ramp(n.notch.Q, 0.1);
  }

  ramp(n.lowPass.frequency, s.lowPassFreq);

  ramp(n.eq60.gain, s.equalizer.sub60);
  ramp(n.eq250.gain, s.equalizer.low250);
  ramp(n.eq1k.gain, s.equalizer.mid1k);
  ramp(n.eq4k.gain, s.equalizer.pres4k);
  ramp(n.eq12k.gain, s.equalizer.high12k);

  ramp(n.speech.frequency, s.speechFreq);
  ramp(n.speech.gain, s.speechBoost);

  ramp(n.compressor.threshold, -50 * s.compression);
  ramp(n.compressor.ratio, 1 + 11 * s.compression);
  ramp(n.compressor.knee, 10 + 20 * s.compression);

  ramp(n.userGain.gain, s.volume * (1 + s.compression * 0.8));
}

export function useVideoAudioEnhancer(videoRef: RefObject<HTMLVideoElement>) {
  const [settings, setSettings] = useState<AudioSettings>(PRESETS.flat.settings);
  const [activePreset, setActivePreset] = useState<PresetId | null>('flat');
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nodesRef = useRef<Nodes | null>(null);
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  const startGateLoop = useCallback((nodes: Nodes) => {
    const pcmData = new Float32Array(512);
    let isGated = false;
    let silentFrameCount = 0;

    const check = () => {
      if (!nodes.ctx || nodes.ctx.state === 'closed') return;
      const s = settingsRef.current;
      const v = videoRef.current;

      nodes.analyser.getFloatTimeDomainData(pcmData);
      let sumSquares = 0;
      for (let i = 0; i < pcmData.length; i++) {
        sumSquares += pcmData[i] * pcmData[i];
      }
      const rms = Math.sqrt(sumSquares / pcmData.length);
      const db = rms > 1e-5 ? 20 * Math.log10(rms) : -100;

      if (s.noiseGate) {
        if (db < s.gateThreshold) {
          if (!isGated) {
            nodes.gateGain.gain.setTargetAtTime(0.08, nodes.ctx.currentTime, 0.05);
            isGated = true;
          }
        } else {
          if (isGated) {
            nodes.gateGain.gain.setTargetAtTime(1.0, nodes.ctx.currentTime, 0.008);
            isGated = false;
          }
        }
      } else {
        if (isGated) {
          nodes.gateGain.gain.setTargetAtTime(1.0, nodes.ctx.currentTime, 0.02);
          isGated = false;
        }
      }

      if (s.smartSilenceSkip && v && !v.paused) {
        if (db < -42) {
          silentFrameCount++;
          if (silentFrameCount > 25) {
            v.playbackRate = 2.5;
          }
        } else {
          if (silentFrameCount > 25) {
            v.playbackRate = 1.0;
          }
          silentFrameCount = 0;
        }
      }

      requestAnimationFrame(check);
    };

    requestAnimationFrame(check);
  }, [videoRef]);

  const ensureStarted = useCallback(async () => {
    const el = videoRef.current;
    if (!el) return;
    try {
      let entry = sourceCache.get(el);
      if (!entry) {
        const ctx = new AudioContext();
        const source = ctx.createMediaElementSource(el);

        const splitter = ctx.createChannelSplitter(2);
        const merger = ctx.createChannelMerger(2);
        const gainLL = ctx.createGain();
        const gainLR = ctx.createGain();
        const gainRL = ctx.createGain();
        const gainRR = ctx.createGain();

        source.connect(splitter);
        splitter.connect(gainLL, 0);
        splitter.connect(gainLR, 0);
        splitter.connect(gainRL, 1);
        splitter.connect(gainRR, 1);
        gainLL.connect(merger, 0, 0);
        gainRL.connect(merger, 0, 0);
        gainLR.connect(merger, 0, 1);
        gainRR.connect(merger, 0, 1);

        const matrix: MatrixNodes = { splitter, merger, gainLL, gainLR, gainRL, gainRR };

        const highPass = ctx.createBiquadFilter();
        highPass.type = 'highpass';
        highPass.Q.value = 0.707;

        const notch = ctx.createBiquadFilter();
        notch.type = 'notch';
        notch.frequency.value = 10;
        notch.Q.value = 0.1;

        const lowPass = ctx.createBiquadFilter();
        lowPass.type = 'lowpass';
        lowPass.frequency.value = 20000;
        lowPass.Q.value = 0.707;

        const eq60 = ctx.createBiquadFilter();
        eq60.type = 'lowshelf';
        eq60.frequency.value = 60;

        const eq250 = ctx.createBiquadFilter();
        eq250.type = 'peaking';
        eq250.frequency.value = 250;
        eq250.Q.value = 1.0;

        const eq1k = ctx.createBiquadFilter();
        eq1k.type = 'peaking';
        eq1k.frequency.value = 1000;
        eq1k.Q.value = 1.0;

        const eq4k = ctx.createBiquadFilter();
        eq4k.type = 'peaking';
        eq4k.frequency.value = 4000;
        eq4k.Q.value = 1.0;

        const eq12k = ctx.createBiquadFilter();
        eq12k.type = 'highshelf';
        eq12k.frequency.value = 12000;

        const speech = ctx.createBiquadFilter();
        speech.type = 'peaking';
        speech.Q.value = 1.1;

        const compressor = ctx.createDynamicsCompressor();
        compressor.attack.value = 0.005;
        compressor.release.value = 0.25;

        const analyser = ctx.createAnalyser();
        analyser.fftSize = 512;
        const gateGain = ctx.createGain();
        gateGain.gain.value = 1.0;

        const userGain = ctx.createGain();

        const limiter = ctx.createDynamicsCompressor();
        limiter.threshold.value = -1.0;
        limiter.knee.value = 0;
        limiter.ratio.value = 20;
        limiter.attack.value = 0.001;
        limiter.release.value = 0.1;

        merger.connect(highPass);
        highPass.connect(notch);
        notch.connect(lowPass);
        lowPass.connect(eq60);
        eq60.connect(eq250);
        eq250.connect(eq1k);
        eq1k.connect(eq4k);
        eq4k.connect(eq12k);
        eq12k.connect(speech);
        speech.connect(compressor);
        compressor.connect(analyser);
        analyser.connect(gateGain);
        gateGain.connect(userGain);
        userGain.connect(limiter);
        limiter.connect(ctx.destination);

        const nodes: Nodes = {
          ctx,
          matrix,
          highPass,
          notch,
          lowPass,
          eq60,
          eq250,
          eq1k,
          eq4k,
          eq12k,
          speech,
          compressor,
          analyser,
          gateGain,
          userGain,
          limiter,
        };

        const rafId = { current: 0 };
        entry = { nodes, rafId };
        sourceCache.set(el, entry);

        startGateLoop(nodes);
      }

      nodesRef.current = entry.nodes;
      if (entry.nodes.ctx.state === 'suspended') await entry.nodes.ctx.resume();
      applyToNodes(entry.nodes, settingsRef.current);
      setIsReady(true);
      setError(null);
    } catch (e) {
      setError('Não foi possível iniciar o processamento de áudio: ' + (e as Error).message);
    }
  }, [videoRef, startGateLoop]);

  useEffect(() => {
    if (nodesRef.current) applyToNodes(nodesRef.current, settings);
  }, [settings]);

  const setSetting = useCallback(<K extends keyof AudioSettings>(key: K, value: AudioSettings[K]) => {
    setSettings((s) => ({ ...s, [key]: value }));
    setActivePreset(null);
  }, []);

  const applyPreset = useCallback((id: PresetId) => {
    setSettings(PRESETS[id].settings);
    setActivePreset(id);
  }, []);

  const setAllSettings = useCallback((newSettings: AudioSettings) => {
    setSettings(newSettings);
    setActivePreset(null);
  }, []);

  const exportDestinationRef = useRef<MediaStreamAudioDestinationNode | null>(null);

  const getExportDestinationNode = useCallback((): MediaStreamAudioDestinationNode | null => {
    if (!nodesRef.current) return null;
    const ctx = nodesRef.current.ctx;
    if (!exportDestinationRef.current || exportDestinationRef.current.context !== ctx) {
      exportDestinationRef.current = ctx.createMediaStreamDestination();
      nodesRef.current.limiter.connect(exportDestinationRef.current);
    }
    return exportDestinationRef.current;
  }, []);

  return {
    settings,
    setSetting,
    setAllSettings,
    applyPreset,
    activePreset,
    ensureStarted,
    isReady,
    error,
    analyserRef: nodesRef.current?.analyser ?? null,
    getExportDestinationNode,
  };
}
