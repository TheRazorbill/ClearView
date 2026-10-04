import { describe, expect, it } from 'vitest';
import { cuesToSrt, cuesToVtt, formatClock, parseSubtitles } from '../utils/subtitles';

describe('Subtitle Utilities', () => {
  it('formats clock times correctly', () => {
    expect(formatClock(0)).toBe('0:00');
    expect(formatClock(45)).toBe('0:45');
    expect(formatClock(75)).toBe('1:15');
    expect(formatClock(3665)).toBe('1:01:05');
    expect(formatClock(NaN)).toBe('0:00');
    expect(formatClock(Infinity)).toBe('0:00');
  });

  it('parses SRT subtitle files accurately', () => {
    const rawSrt = `1
00:00:01,000 --> 00:00:04,500
Olá, bem-vindo ao ClearView!

2
00:00:05,200 --> 00:00:08,000
Este é um <b>teste</b> de legendas.`;

    const cues = parseSubtitles(rawSrt);
    expect(cues).toHaveLength(2);
    expect(cues[0].start).toBeCloseTo(1.0);
    expect(cues[0].end).toBeCloseTo(4.5);
    expect(cues[0].text).toBe('Olá, bem-vindo ao ClearView!');
    expect(cues[1].text).toBe('Este é um teste de legendas.');
  });

  it('parses WebVTT format correctly', () => {
    const rawVtt = `WEBVTT

00:00:02.000 --> 00:00:05.000
Primeira fala do vídeo.

00:00:06.500 --> 00:00:10.200
Segunda fala do vídeo.`;

    const cues = parseSubtitles(rawVtt);
    expect(cues).toHaveLength(2);
    expect(cues[0].start).toBeCloseTo(2.0);
    expect(cues[0].end).toBeCloseTo(5.0);
    expect(cues[1].start).toBeCloseTo(6.5);
    expect(cues[1].end).toBeCloseTo(10.2);
  });

  it('serializes cues to valid WebVTT and SRT', () => {
    const cues = [{ start: 1.5, end: 4.25, text: 'Teste de exportação' }];

    const vtt = cuesToVtt(cues);
    expect(vtt).toContain('WEBVTT');
    expect(vtt).toContain('00:00:01.500 --> 00:00:04.250');
    expect(vtt).toContain('Teste de exportação');

    const srt = cuesToSrt(cues);
    expect(srt).toContain('00:00:01,500 --> 00:00:04,250');
    expect(srt).toContain('Teste de exportação');
  });

  it('calculates active cue with sync offset', () => {
    const cues = [{ start: 10, end: 15, text: 'Frase original em 10s' }];

    const currentTime = 10.2;

    expect(cues.find((c) => currentTime >= c.start && currentTime < c.end)?.text).toBe(
      'Frase original em 10s',
    );

    const offset = 0.5;
    const adjustedTime = currentTime - offset;
    expect(cues.find((c) => adjustedTime >= c.start && adjustedTime < c.end)).toBeUndefined();
  });
});
