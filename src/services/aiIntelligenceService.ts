import { Cue } from '../utils/subtitles';
import { TranscriptionConfig } from './transcriptionService';
import { VideoChapter, VideoChatMessage, VideoSummary } from '../types/playerSettings';

function formatTranscriptForPrompt(cues: Cue[]): string {
  return cues
    .map((c) => {
      const m = Math.floor(c.start / 60);
      const s = Math.floor(c.start % 60);
      const time = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
      return `[${time}] ${c.text}`;
    })
    .join('\n');
}

async function callLlm(prompt: string, cfg: TranscriptionConfig): Promise<string> {
  if (!cfg.apiKey) {
    throw new Error('Chave de API não informada. Configure nas opções de Legendas IA.');
  }

  if (cfg.provider === 'gemini') {
    const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent';
    const body = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.2 },
    };
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': cfg.apiKey },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      throw new Error(`Erro na API do Gemini (${res.status}). Verifique sua chave.`);
    }
    const json = await res.json();
    return json.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  }

  const endpoint =
    cfg.provider === 'groq'
      ? 'https://api.groq.com/openai/v1/chat/completions'
      : 'https://api.openai.com/v1/chat/completions';
  const model = cfg.provider === 'groq' ? 'llama-3.3-70b-versatile' : 'gpt-4o-mini';

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${cfg.apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
    }),
  });

  if (!res.ok) {
    throw new Error(`Erro na API ${cfg.provider} (${res.status}). Verifique sua chave.`);
  }
  const json = await res.json();
  return json.choices?.[0]?.message?.content ?? '';
}

export async function generateChapters(cues: Cue[], cfg: TranscriptionConfig): Promise<VideoChapter[]> {
  if (!cues.length) return [];
  const text = formatTranscriptForPrompt(cues.slice(0, 400));

  const prompt = `Analise a transcrição com timestamps abaixo e identifique os capítulos/tópicos principais do vídeo.
Retorne APENAS um JSON válido no formato:
[
  { "title": "Nome do Capítulo", "start": 0 },
  { "title": "Outro Tópico", "start": 125.5 }
]
Importante: O campo "start" deve ser em SEGUNDOS numéricos. Crie entre 3 e 8 capítulos relevantes. Não use markdown na resposta, apenas o JSON puro.

Transcrição:
${text}`;

  const raw = await callLlm(prompt, cfg);
  const cleanJson = raw.replace(/```json/g, '').replace(/```/g, '').trim();
  try {
    const parsed = JSON.parse(cleanJson) as VideoChapter[];
    return parsed.filter((c) => typeof c.start === 'number' && c.title);
  } catch {
    throw new Error('Não foi possível gerar capítulos automáticos. Tente novamente.');
  }
}

export async function generateSummary(cues: Cue[], cfg: TranscriptionConfig): Promise<VideoSummary> {
  if (!cues.length) throw new Error('Não há legendas para resumir.');
  const text = formatTranscriptForPrompt(cues.slice(0, 500));

  const prompt = `Gere um resumo conciso e profissional em português para o conteúdo deste vídeo.
Retorne APENAS um JSON no formato:
{
  "overview": "Parágrafo com a ideia central do vídeo...",
  "keyPoints": [
    "Ponto importante 1",
    "Ponto importante 2",
    "Ponto importante 3"
  ]
}
Não use formatação markdown em volta, apenas o JSON puro.

Transcrição:
${text}`;

  const raw = await callLlm(prompt, cfg);
  const cleanJson = raw.replace(/```json/g, '').replace(/```/g, '').trim();
  try {
    const parsed = JSON.parse(cleanJson) as VideoSummary;
    return {
      overview: parsed.overview || 'Resumo indisponível.',
      keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints : [],
    };
  } catch {
    throw new Error('Não foi possível gerar o resumo. Tente novamente.');
  }
}

export async function answerVideoQuestion(
  arg1: string | Cue[],
  arg2: string | Cue[],
  arg3?: VideoChatMessage[] | TranscriptionConfig,
  arg4?: TranscriptionConfig,
): Promise<{ text: string; timestamp?: number; answer: string; matchedTime?: number }> {
  let question: string;
  let cues: Cue[];
  let cfg: TranscriptionConfig;

  if (typeof arg1 === 'string') {
    question = arg1;
    cues = arg2 as Cue[];
    cfg = (arg4 || arg3) as TranscriptionConfig;
  } else {
    cues = arg1 as Cue[];
    question = arg2 as string;
    cfg = (arg4 || arg3) as TranscriptionConfig;
  }

  const text = formatTranscriptForPrompt((cues || []).slice(0, 600));

  const prompt = `Você é um assistente especialista no conteúdo deste vídeo.
Com base EXCLUSIVAMENTE na transcrição com timestamps fornecida, responda à pergunta do usuário de forma clara, objetiva e útil.
Se a resposta estiver em algum trecho específico, mencione o timestamp em segundos no formato JSON:
{
  "answer": "Sua resposta completa...",
  "timestamp": 125
}
Caso não haja timestamp exato, use timestamp: null. Retorne APENAS o JSON puro.

Transcrição:
${text}

Pergunta do usuário:
${question}`;

  const raw = await callLlm(prompt, cfg);
  const cleanJson = raw.replace(/```json/g, '').replace(/```/g, '').trim();
  try {
    const parsed = JSON.parse(cleanJson);
    const ansText = parsed.answer || raw;
    const timeVal = typeof parsed.timestamp === 'number' ? parsed.timestamp : undefined;
    return {
      text: ansText,
      timestamp: timeVal,
      answer: ansText,
      matchedTime: timeVal,
    };
  } catch {
    return { text: raw, answer: raw };
  }
}

export async function translateSubtitles(
  cues: Cue[],
  targetLanguage: string,
  cfg: TranscriptionConfig,
): Promise<Cue[]> {
  if (!cues.length) return [];
  const BATCH_SIZE = 50;
  const translated: Cue[] = [];

  for (let i = 0; i < cues.length; i += BATCH_SIZE) {
    const batch = cues.slice(i, i + BATCH_SIZE);
    const inputLines = batch.map((c, idx) => `${idx + 1}. ${c.text}`).join('\n');

    const prompt = `Traduza as seguintes frases numeradas de legenda para o idioma "${targetLanguage}".
Mantenha exatamente a mesma numeração e quantidade de frases. Não altere o sentido nem invente frases adicionais.
Retorne apenas as linhas traduzidas numeradas.

Frases:
${inputLines}`;

    const raw = await callLlm(prompt, cfg);
    const lines = raw.split('\n').filter((l) => l.trim().length > 0);

    batch.forEach((cue, idx) => {
      const match = lines.find((l) => l.trim().startsWith(`${idx + 1}.`));
      const cleanText = match ? match.replace(/^\d+\.\s*/, '').trim() : cue.text;
      translated.push({
        ...cue,
        text: cleanText,
      });
    });
  }

  return translated;
}
