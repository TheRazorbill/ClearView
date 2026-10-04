import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  buildCssFilterString,
  renderSubtitleOnCanvas,
  getBestSupportedMimeType,
} from '../services/videoExportService';
import {
  DEFAULT_SUBTITLE_CONFIG,
  DEFAULT_VIDEO_FILTERS,
  SubtitleConfig,
  VideoFilters,
} from '../types/playerSettings';

describe('videoExportService', () => {
  describe('buildCssFilterString', () => {
    it('returns "none" for default filters', () => {
      expect(buildCssFilterString(DEFAULT_VIDEO_FILTERS)).toBe('none');
    });

    it('includes hue rotation so exports match the live preview', () => {
      const filters: VideoFilters = { ...DEFAULT_VIDEO_FILTERS, hueRotate: 340 };
      expect(buildCssFilterString(filters)).toBe('hue-rotate(340deg)');
    });

    it('generates correct CSS filter string for customized filters', () => {
      const customFilters: VideoFilters = {
        ...DEFAULT_VIDEO_FILTERS,
        brightness: 120,
        contrast: 110,
        saturate: 130,
        sepia: 25,
        grayscale: 10,
        blur: 2,
      };
      const result = buildCssFilterString(customFilters);
      expect(result).toContain('brightness(120%)');
      expect(result).toContain('contrast(110%)');
      expect(result).toContain('saturate(130%)');
      expect(result).toContain('sepia(25%)');
      expect(result).toContain('grayscale(10%)');
      expect(result).toContain('blur(2px)');
      expect(result).not.toContain('invert');
    });
  });

  describe('renderSubtitleOnCanvas', () => {
    let mockCtx: any;

    beforeEach(() => {
      mockCtx = {
        save: vi.fn(),
        restore: vi.fn(),
        fillText: vi.fn(),
        measureText: vi.fn().mockReturnValue({ width: 120 }),
        beginPath: vi.fn(),
        roundRect: vi.fn(),
        rect: vi.fn(),
        fill: vi.fn(),
        font: '',
        textAlign: '',
        textBaseline: '',
        fillStyle: '',
        shadowColor: '',
        shadowBlur: 0,
        shadowOffsetX: 0,
        shadowOffsetY: 0,
      };
    });

    it('does nothing when text is empty or blank', () => {
      const config: SubtitleConfig = { ...DEFAULT_SUBTITLE_CONFIG, size: 'medium' };
      renderSubtitleOnCanvas(mockCtx, '   ', config, 1920, 1080);
      expect(mockCtx.save).not.toHaveBeenCalled();
      expect(mockCtx.fillText).not.toHaveBeenCalled();
    });

    it('renders single line subtitle with translucent background', () => {
      const config: SubtitleConfig = { ...DEFAULT_SUBTITLE_CONFIG, size: 'medium' };
      renderSubtitleOnCanvas(mockCtx, 'Test subtitle', config, 1920, 1080);
      expect(mockCtx.save).toHaveBeenCalled();
      expect(mockCtx.fillText).toHaveBeenCalledWith('Test subtitle', 960, expect.any(Number));
      expect(mockCtx.fill).toHaveBeenCalled();
      expect(mockCtx.restore).toHaveBeenCalled();
    });

    it('renders top positioned subtitle when position is top', () => {
      const config: SubtitleConfig = {
        ...DEFAULT_SUBTITLE_CONFIG,
        size: 'large',
        bg: 'solid',
        position: 'top',
      };
      renderSubtitleOnCanvas(mockCtx, 'Top subtitle line 1\nLine 2', config, 1280, 720);
      expect(mockCtx.save).toHaveBeenCalled();
      expect(mockCtx.fillText).toHaveBeenCalledTimes(2);
      expect(mockCtx.restore).toHaveBeenCalled();
    });
  });

  describe('getBestSupportedMimeType', () => {
    it('returns a fallback string when MediaRecorder is undefined', () => {
      const originalMediaRecorder = (globalThis as any).MediaRecorder;
      delete (globalThis as any).MediaRecorder;

      const mimeType = getBestSupportedMimeType();
      expect(mimeType).toBe('video/webm');

      (globalThis as any).MediaRecorder = originalMediaRecorder;
    });

    it('selects first supported MIME type when available', () => {
      const originalMediaRecorder = (globalThis as any).MediaRecorder;
      (globalThis as any).MediaRecorder = {
        isTypeSupported: (type: string) => type.includes('video/mp4'),
      };

      const mimeType = getBestSupportedMimeType();
      expect(mimeType).toBe('video/mp4;codecs=avc1,mp4a');

      (globalThis as any).MediaRecorder = originalMediaRecorder;
    });
  });
});
