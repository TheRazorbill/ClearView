import type { Cue } from '../utils/subtitles';

export type Provider = 'groq' | 'openai' | 'gemini';

export interface TranscriptionConfig {
  provider: Provider;
  apiKey: string;
  language?: string;
}

export const PROVIDERS: Record<Provider, { label: string; endpoint: string; model: string; keyUrl: string; free: boolean }> = {
  groq: {
    label: 'Groq (Whisper Large v3 Turbo)',
    endpoint: 'https://api.groq.com/openai/v1/audio/transcriptions',
    model: 'whisper-large-v3-turbo',
    keyUrl: 'https://console.groq.com/keys',
    free: true,
  },
  openai: {
    label: 'OpenAI (Whisper-1)',
    endpoint: 'https://api.openai.com/v1/audio/transcriptions',
    model: 'whisper-1',
    keyUrl: 'https://platform.openai.com/api-keys',
    free: false,
  },
  gemini: {
    label: 'Google Gemini (3.8 Flash)',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent',
    model: 'gemini-3.8-flash',
    keyUrl: 'https://aistudio.google.com/apikey',
    free: true,
  },
};

export class TranscriptionError extends Error {
  constructor(message: string, public retryable = false) { super(message); }
}

const MAX_RETRIES = 5;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const TARGET_RATE = 16000;
const CHUNK_SECONDS: Record<Provider, number> = { groq: 600, openai: 600, gemini: 300 };
const MAX_FILE_BYTES = 2 * 1024 ** 3;

export type ProgressFn = (stage: string, pct: number) => void;

export async function extractAudio(media: Blob, onProgress?: ProgressFn): Promise<AudioBuffer> {
  if (media.size > MAX_FILE_BYTES) {
    throw new TranscriptionError('Arquivo muito pesado (> 2 GB) para processar no navegador.');
  }
  onProgress?.('Lendo arquivo…', 2);
  const data = await media.arrayBuffer();

  onProgress?.('Decodificando áudio…', 8);
  const tmp = new AudioContext();
  let decoded: AudioBuffer;
  try {
    decoded = await tmp.decodeAudioData(data);
  } catch {
    throw new TranscriptionError(
      'Não foi possível extrair o áudio. O vídeo pode não ter faixa de áudio ou usar um codec não suportado pelo navegador.',
    );
  } finally {
    tmp.close();
  }

  onProgress?.('Convertendo para mono 16 kHz…', 15);
  const offline = new OfflineAudioContext(1, Math.ceil(decoded.duration * TARGET_RATE), TARGET_RATE);
  const src = offline.createBufferSource();
  src.buffer = decoded;
  src.connect(offline.destination);
  src.start();
  const rendered = await offline.startRendering();

  const ch = rendered.getChannelData(0);
  let peak = 0;
  for (let i = 0; i < ch.length; i += 64) peak = Math.max(peak, Math.abs(ch[i]));
  if (peak < 1e-4) throw new TranscriptionError('A faixa de áudio está em silêncio: nada para transcrever.');
  return rendered;
}

function encodeWav(samples: Float32Array, sampleRate: number): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const v = new DataView(buffer);
  const w = (o: number, s: string) => [...s].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
  w(0, 'RIFF'); v.setUint32(4, 36 + samples.length * 2, true); w(8, 'WAVE');
  w(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, sampleRate, true); v.setUint32(28, sampleRate * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true);
  w(36, 'data'); v.setUint32(40, samples.length * 2, true);
  for (let i = 0, o = 44; i < samples.length; i++, o += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    v.setInt16(o, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return new Blob([buffer], { type: 'audio/wav' });
}

async function blobToBase64(blob: Blob): Promise<string> {
  const url: string = await new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(blob);
  });
  return url.slice(url.indexOf(',') + 1);
}

async function throwApiError(res: Response): Promise<never> {
  let detail = '';
  try { detail = (await res.json())?.error?.message ?? ''; } catch { /* ignore */ }
  if (res.status === 401 || res.status === 403 || /api key/i.test(detail)) throw new TranscriptionError('Chave de API inválida ou sem permissão.');
  if (res.status === 413) throw new TranscriptionError('Trecho de áudio grande demais para a API.');
  if (res.status === 429) throw new TranscriptionError('Limite de requisições/cota atingido. Aguarde e tente novamente.', true);
  if (res.status >= 500) throw new TranscriptionError(`Servidor do provedor sobrecarregado (erro ${res.status}). Tente novamente em alguns minutos.`, true);
  throw new TranscriptionError(`Erro ${res.status} da API. ${detail}`);
}

async function requestGeminiChunk(wav: Blob, cfg: TranscriptionConfig, chunkDuration: number): Promise<Cue[]> {
  const p = PROVIDERS.gemini;
  const lang = cfg.language ? ` A fala está no idioma "${cfg.language}"; transcreva nesse idioma.` : ' Transcreva no idioma original falado.';
  const body = {
    contents: [{
      parts: [
        { inline_data: { mime_type: 'audio/wav', data: await blobToBase64(wav) } },
        { text: `Transcreva este áudio (duração ${chunkDuration.toFixed(1)}s) como legendas. Divida em frases curtas (máx. ~7s cada) com tempos de início e fim em SEGUNDOS a partir do início deste áudio. Não traduza, não resuma, ignore silêncio e música sem fala.${lang}` },
      ],
    }],
    generationConfig: {
      temperature: 0,
      responseMimeType: 'application/json',
      responseSchema: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: { start: { type: 'NUMBER' }, end: { type: 'NUMBER' }, text: { type: 'STRING' } },
          required: ['start', 'end', 'text'],
        },
      },
    },
  };

  let res: Response;
  try {
    res = await fetch(p.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': cfg.apiKey },
      body: JSON.stringify(body),
    });
  } catch {
    throw new TranscriptionError('Falha de rede ao contatar a API do Gemini.');
  }
  if (!res.ok) await throwApiError(res);
  const json = await res.json();
  const text: string = json.candidates?.[0]?.content?.parts?.map((x: { text?: string }) => x.text ?? '').join('') ?? '';
  if (!text) return [];
  try {
    const arr = JSON.parse(text) as Cue[];
    return arr
      .filter((c) => typeof c.start === 'number' && c.text)
      .map((c) => ({ start: Math.max(0, c.start), end: Math.min(chunkDuration, Math.max(c.end, c.start + 0.5)), text: c.text.trim() }));
  } catch {
    throw new TranscriptionError('O Gemini retornou uma resposta em formato inesperado. Tente novamente.');
  }
}

async function requestChunk(wav: Blob, cfg: TranscriptionConfig): Promise<Cue[]> {
  const p = PROVIDERS[cfg.provider];
  const form = new FormData();
  form.append('file', wav, 'audio.wav');
  form.append('model', p.model);
  form.append('response_format', 'verbose_json');
  form.append('timestamp_granularities[]', 'segment');
  if (cfg.language) form.append('language', cfg.language);

  let res: Response;
  try {
    res = await fetch(p.endpoint, { method: 'POST', headers: { Authorization: `Bearer ${cfg.apiKey}` }, body: form });
  } catch {
    throw new TranscriptionError('Falha de rede ao contatar a API de transcrição.');
  }
  if (!res.ok) await throwApiError(res);
  const json = await res.json();
  return (json.segments ?? []).map((s: { start: number; end: number; text: string }) => ({
    start: s.start, end: s.end, text: s.text.trim(),
  }));
}

async function withRetry<T>(fn: () => Promise<T>, onRetry: (attempt: number, waitS: number) => void): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fn();
    } catch (e) {
      if (!(e instanceof TranscriptionError) || !e.retryable || attempt >= MAX_RETRIES) throw e;
      const waitS = Math.min(60, 4 * 2 ** attempt);
      onRetry(attempt + 1, waitS);
      await sleep(waitS * 1000);
    }
  }
}

export async function transcribe(media: Blob, cfg: TranscriptionConfig, onProgress?: ProgressFn): Promise<Cue[]> {
  if (!cfg.apiKey) throw new TranscriptionError('Informe sua chave de API antes de gerar legendas.');
  const audio = await extractAudio(media, onProgress);
  const data = audio.getChannelData(0);
  const chunkSeconds = CHUNK_SECONDS[cfg.provider];
  const chunkLen = chunkSeconds * TARGET_RATE;
  const total = Math.ceil(data.length / chunkLen);
  const cues: Cue[] = [];

  for (let i = 0; i < total; i++) {
    onProgress?.(`Transcrevendo trecho ${i + 1} de ${total}…`, 20 + Math.round((i / total) * 78));
    const slice = data.subarray(i * chunkLen, (i + 1) * chunkLen);
    const wav = encodeWav(slice, TARGET_RATE);
    const offset = i * chunkSeconds;
    const part = await withRetry(
      () => (cfg.provider === 'gemini' ? requestGeminiChunk(wav, cfg, slice.length / TARGET_RATE) : requestChunk(wav, cfg)),
      (attempt, waitS) => onProgress?.(`Servidor ocupado: nova tentativa ${attempt}/${MAX_RETRIES} do trecho ${i + 1} em ${waitS}s…`, 20 + Math.round((i / total) * 78)),
    );
    cues.push(...part.filter((c) => c.text).map((c) => ({ ...c, start: c.start + offset, end: c.end + offset })));
  }
  onProgress?.('Concluído', 100);
  return cues;
}
