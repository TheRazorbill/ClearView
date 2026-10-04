export interface Cue {
  start: number;
  end: number;
  text: string;
}

function parseTimestamp(ts: string): number {
  const parts = ts.trim().replace(',', '.').split(':');
  let s = 0;
  for (const p of parts) s = s * 60 + parseFloat(p);
  return s;
}

export function parseSubtitles(raw: string): Cue[] {
  const text = raw.replace(/\r/g, '').replace(/^\uFEFF/, '');
  const blocks = text.split(/\n{2,}/);
  const cues: Cue[] = [];
  const timeRe = /((?:\d+:)?\d{1,2}:\d{2}[.,]\d{1,3})\s*-->\s*((?:\d+:)?\d{1,2}:\d{2}[.,]\d{1,3})/;
  for (const block of blocks) {
    const lines = block.split('\n');
    const idx = lines.findIndex((l) => timeRe.test(l));
    if (idx === -1) continue;
    const m = lines[idx].match(timeRe)!;
    const body = lines.slice(idx + 1).join('\n').replace(/<[^>]+>/g, '').trim();
    if (body) cues.push({ start: parseTimestamp(m[1]), end: parseTimestamp(m[2]), text: body });
  }
  return cues;
}

function vttTime(t: number): string {
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const s = (t % 60).toFixed(3).padStart(6, '0');
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${s}`;
}

export function cuesToVtt(cues: Cue[]): string {
  return 'WEBVTT\n\n' + cues.map((c, i) => `${i + 1}\n${vttTime(c.start)} --> ${vttTime(c.end)}\n${c.text}`).join('\n\n');
}

export function cuesToSrt(cues: Cue[]): string {
  return cues
    .map((c, i) => `${i + 1}\n${vttTime(c.start).replace('.', ',')} --> ${vttTime(c.end).replace('.', ',')}\n${c.text}`)
    .join('\n\n');
}

export function formatClock(t: number): string {
  if (!isFinite(t)) return '0:00';
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const s = Math.floor(t % 60).toString().padStart(2, '0');
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${s}` : `${m}:${s}`;
}
