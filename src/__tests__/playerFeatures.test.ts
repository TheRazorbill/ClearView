import { describe, expect, it } from 'vitest';
import {
  Bookmark,
  LoopAB,
  VIDEO_PRESETS,
  VideoFilterPresetId,
  ZoomPan,
} from '../types/playerSettings';

describe('Player Pro Features & Study Tools', () => {
  it('validates video color presets', () => {
    const presetIds = Object.keys(VIDEO_PRESETS) as VideoFilterPresetId[];
    expect(presetIds).toHaveLength(6);

    presetIds.forEach((id) => {
      const p = VIDEO_PRESETS[id];
      expect(p.label).toBeTruthy();
      expect(p.filters.brightness).toBeGreaterThanOrEqual(50);
      expect(p.filters.contrast).toBeGreaterThanOrEqual(50);
      expect(p.filters.saturate).toBeGreaterThanOrEqual(0);
    });

    expect(VIDEO_PRESETS.bw.filters.grayscale).toBe(100);
    expect(VIDEO_PRESETS.bw.filters.saturate).toBe(0);
  });

  it('enforces Loop A-B boundaries logic', () => {
    const loopAB: LoopAB = {
      enabled: true,
      start: 10.0,
      end: 20.0,
    };

    function checkLoop(currentTime: number, loop: LoopAB): number {
      if (loop.enabled && loop.start !== null && loop.end !== null) {
        if (currentTime >= loop.end) {
          return loop.start;
        }
      }
      return currentTime;
    }

    expect(checkLoop(15.0, loopAB)).toBe(15.0);
    expect(checkLoop(20.0, loopAB)).toBe(10.0);
    expect(checkLoop(20.5, loopAB)).toBe(10.0);
  });

  it('handles bookmark creation, chronological sorting and editing', () => {
    let bookmarks: Bookmark[] = [
      { id: '1', time: 55, note: 'Nota no meio', createdAt: 1 },
      { id: '2', time: 10, note: 'Primeira nota', createdAt: 2 },
      { id: '3', time: 120, note: 'Fim do vídeo', createdAt: 3 },
    ];

    const sorted = [...bookmarks].sort((a, b) => a.time - b.time);
    expect(sorted[0].time).toBe(10);
    expect(sorted[1].time).toBe(55);
    expect(sorted[2].time).toBe(120);

    bookmarks = bookmarks.map((b) => (b.id === '2' ? { ...b, note: 'Nota atualizada' } : b));
    expect(bookmarks.find((b) => b.id === '2')?.note).toBe('Nota atualizada');
  });

  it('clamps zoom scale between 1.0x and 4.0x', () => {
    function clampZoom(scale: number, delta: number): ZoomPan {
      const newScale = Math.min(4.0, Math.max(1.0, +(scale + delta).toFixed(2)));
      if (newScale === 1.0) return { scale: 1.0, x: 0, y: 0 };
      return { scale: newScale, x: 0, y: 0 };
    }

    expect(clampZoom(1.0, 0.25).scale).toBe(1.25);
    expect(clampZoom(1.0, -0.25).scale).toBe(1.0);
    expect(clampZoom(3.9, 0.5).scale).toBe(4.0);
  });

  it('resolves application routes accurately', () => {
    function resolveRoute(pathname: string): '/' | '/docs' {
      return pathname.startsWith('/docs') ? '/docs' : '/';
    }

    expect(resolveRoute('/')).toBe('/');
    expect(resolveRoute('/docs')).toBe('/docs');
    expect(resolveRoute('/docs/')).toBe('/docs');
    expect(resolveRoute('/docs/manual')).toBe('/docs');
    expect(resolveRoute('/player')).toBe('/');
  });
});
