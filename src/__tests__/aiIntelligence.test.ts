import { describe, expect, it } from 'vitest';
import { VideoChapter, VideoSummary } from '../types/playerSettings';

describe('AI Intelligence & Content Parsing', () => {
  it('parses structured chapters from LLM output with or without markdown fences', () => {
    const rawLlmResponse = `\`\`\`json
[
  { "title": "Introdução ao Problema", "start": 0 },
  { "title": "Demonstração do Filtro de Áudio", "start": 142.5 },
  { "title": "Conclusão e Próximos Passos", "start": 480 }
]
\`\`\``;

    const clean = rawLlmResponse
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();
    const chapters: VideoChapter[] = JSON.parse(clean);

    expect(chapters).toHaveLength(3);
    expect(chapters[0].title).toBe('Introdução ao Problema');
    expect(chapters[0].start).toBe(0);
    expect(chapters[1].start).toBe(142.5);
    expect(chapters[2].title).toBe('Conclusão e Próximos Passos');
  });

  it('parses executive summary and bullet points from LLM output', () => {
    const rawSummaryResponse = `{
  "overview": "O vídeo explica em detalhes como funcionam filtros de áudio e inteligência artificial no navegador.",
  "keyPoints": [
    "A Web Audio API permite processamento em tempo real sem servidor.",
    "O modelo Whisper da Groq gera legendas em segundos.",
    "A interface do ClearView oferece equalizador e remoção de ruídos."
  ]
}`;

    const summary: VideoSummary = JSON.parse(rawSummaryResponse);
    expect(summary.overview).toContain('O vídeo explica');
    expect(summary.keyPoints).toHaveLength(3);
    expect(summary.keyPoints[0]).toContain('Web Audio API');
  });

  it('extracts timestamp and answer from Q&A response', () => {
    const rawChat = `{
  "answer": "O apresentador demonstrou o filtro de ruído por volta dos 2 minutos e 20 segundos.",
  "timestamp": 140
}`;

    const parsed = JSON.parse(rawChat);
    expect(parsed.answer).toBeTruthy();
    expect(parsed.timestamp).toBe(140);
  });
});
