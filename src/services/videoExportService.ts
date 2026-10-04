import { SubtitleConfig, VideoFilters } from '../types/playerSettings';
import { ExportOptions, ExportProgress } from '../types/exportTypes';
import { Cue } from '../utils/subtitles';

export function buildCssFilterString(filters: VideoFilters): string {
  const parts: string[] = [];
  if (filters.brightness !== 100) parts.push(`brightness(${filters.brightness}%)`);
  if (filters.contrast !== 100) parts.push(`contrast(${filters.contrast}%)`);
  if (filters.saturate !== 100) parts.push(`saturate(${filters.saturate}%)`);
  if (filters.sepia > 0) parts.push(`sepia(${filters.sepia}%)`);
  if (filters.grayscale > 0) parts.push(`grayscale(${filters.grayscale}%)`);
  if (filters.hueRotate) parts.push(`hue-rotate(${filters.hueRotate}deg)`);
  if (filters.invert > 0) parts.push(`invert(${filters.invert}%)`);
  if (filters.blur > 0) parts.push(`blur(${filters.blur}px)`);
  return parts.length ? parts.join(' ') : 'none';
}

export function renderSubtitleOnCanvas(
  ctx: CanvasRenderingContext2D,
  text: string,
  config: SubtitleConfig,
  width: number,
  height: number,
): void {
  if (!text.trim()) return;

  let fontSize = 24;
  switch (config.size) {
    case 'small':
      fontSize = Math.max(16, Math.round(height * 0.03));
      break;
    case 'large':
      fontSize = Math.max(28, Math.round(height * 0.055));
      break;
    case 'xlarge':
      fontSize = Math.max(36, Math.round(height * 0.07));
      break;
    case 'medium':
    default:
      fontSize = Math.max(22, Math.round(height * 0.042));
      break;
  }

  ctx.save();
  ctx.font = `600 ${fontSize}px Inter, system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const lines = text.split('\n');
  const lineHeight = fontSize * 1.35;
  const paddingX = fontSize * 0.75;
  const paddingY = fontSize * 0.4;

  const totalTextHeight = lines.length * lineHeight;
  const yCenter =
    config.position === 'top'
      ? Math.round(height * 0.12)
      : Math.round(height * 0.88);

  const blockTop = yCenter - totalTextHeight / 2;

  let maxLineWidth = 0;
  for (const line of lines) {
    const metrics = ctx.measureText(line);
    if (metrics.width > maxLineWidth) maxLineWidth = metrics.width;
  }

  const boxWidth = Math.min(width * 0.9, maxLineWidth + paddingX * 2);
  const boxHeight = totalTextHeight + paddingY * 2;
  const boxLeft = width / 2 - boxWidth / 2;
  const boxTop = blockTop - paddingY;

  if (config.bg === 'solid' || config.bg === 'translucent') {
    ctx.fillStyle = config.bg === 'solid' ? '#000000' : 'rgba(0, 0, 0, 0.78)';
    ctx.beginPath();
    const radius = Math.min(8, fontSize * 0.3);
    ctx.roundRect
      ? ctx.roundRect(boxLeft, boxTop, boxWidth, boxHeight, radius)
      : ctx.rect(boxLeft, boxTop, boxWidth, boxHeight);
    ctx.fill();
  }

  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
  ctx.shadowBlur = config.bg === 'none' ? 6 : 2;
  ctx.shadowOffsetX = 1;
  ctx.shadowOffsetY = 1;

  for (let i = 0; i < lines.length; i++) {
    const lineY = blockTop + i * lineHeight + lineHeight / 2;
    ctx.fillText(lines[i], width / 2, lineY);
  }

  ctx.restore();
}

export function getBestSupportedMimeType(): string {
  if (typeof MediaRecorder === 'undefined') return 'video/webm';
  const candidates = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm',
    'video/mp4;codecs=avc1,mp4a',
    'video/mp4',
  ];
  for (const type of candidates) {
    if (MediaRecorder.isTypeSupported(type)) return type;
  }
  return 'video/webm';
}

export interface RenderCustomizedVideoParams {
  videoElement: HTMLVideoElement;
  options: ExportOptions;
  videoFilters: VideoFilters;
  subtitleConfig: SubtitleConfig;
  cues: Cue[];
  startTime: number;
  endTime: number;
  audioDestinationNode?: MediaStreamAudioDestinationNode;
  onProgress: (p: ExportProgress) => void;
  signal?: AbortSignal;
}

export async function renderCustomizedVideo({
  videoElement,
  options,
  videoFilters,
  subtitleConfig,
  cues,
  startTime,
  endTime,
  audioDestinationNode,
  onProgress,
  signal,
}: RenderCustomizedVideoParams): Promise<Blob> {
  const duration = Math.max(0.1, endTime - startTime);
  const canvas = document.createElement('canvas');
  const width = videoElement.videoWidth || 1280;
  const height = videoElement.videoHeight || 720;
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Falha ao inicializar o contexto 2D do Canvas.');
  }

  const canvasStream = canvas.captureStream(30);
  const combinedStream = new MediaStream();

  canvasStream.getVideoTracks().forEach((t) => combinedStream.addTrack(t));

  if (options.includeAudioFx && audioDestinationNode) {
    audioDestinationNode.stream.getAudioTracks().forEach((t) => combinedStream.addTrack(t));
  } else {
    const audioTrack = (videoElement as any).captureStream?.()?.getAudioTracks?.()?.[0];
    if (audioTrack) combinedStream.addTrack(audioTrack);
  }

  const mimeType = getBestSupportedMimeType();
  const bitrate = options.quality === 'high' ? 3500000 : 1800000;

  const recorder = new MediaRecorder(combinedStream, {
    mimeType,
    videoBitsPerSecond: bitrate,
  });

  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) chunks.push(e.data);
  };

  const wasPlaying = !videoElement.paused;
  const originalTime = videoElement.currentTime;

  return new Promise<Blob>((resolve, reject) => {
    let animId: number;

    const cleanup = () => {
      cancelAnimationFrame(animId);
      videoElement.pause();
      videoElement.currentTime = originalTime;
      if (wasPlaying) videoElement.play().catch(() => {});
    };

    signal?.addEventListener('abort', () => {
      cleanup();
      try {
        if (recorder.state !== 'inactive') recorder.stop();
      } catch {
        /* empty */
      }
      reject(new Error('Exportacao cancelada pelo usuario.'));
    });

    recorder.onstop = () => {
      cleanup();
      const finalBlob = new Blob(chunks, { type: mimeType });
      onProgress({
        percent: 100,
        stage: 'done',
        currentSecond: duration,
        totalSeconds: duration,
      });
      resolve(finalBlob);
    };

    recorder.onerror = (e) => {
      cleanup();
      reject(new Error(`Erro no MediaRecorder: ${e}`));
    };

    const filterString = options.includeVideoFx ? buildCssFilterString(videoFilters) : 'none';

    videoElement.currentTime = startTime;

    const onSeekedInitial = () => {
      videoElement.removeEventListener('seeked', onSeekedInitial);

      recorder.start(500);
      videoElement.play().catch((err) => reject(new Error(`Falha ao iniciar playback: ${err}`)));

      const drawLoop = () => {
        if (signal?.aborted) return;

        const currentSec = videoElement.currentTime;
        const elapsed = Math.max(0, currentSec - startTime);
        const pct = Math.min(99, Math.round((elapsed / duration) * 100));

        onProgress({
          percent: pct,
          stage: 'rendering',
          currentSecond: elapsed,
          totalSeconds: duration,
        });

        ctx.filter = filterString;
        ctx.drawImage(videoElement, 0, 0, width, height);
        ctx.filter = 'none';

        if (options.includeSubtitles && cues.length > 0) {
          const activeCue = cues.find((c) => currentSec >= c.start && currentSec < c.end);
          if (activeCue) {
            renderSubtitleOnCanvas(ctx, activeCue.text, subtitleConfig, width, height);
          }
        }

        if (currentSec >= endTime || videoElement.ended) {
          onProgress({
            percent: 99,
            stage: 'encoding',
            currentSecond: duration,
            totalSeconds: duration,
          });
          recorder.stop();
        } else {
          animId = requestAnimationFrame(drawLoop);
        }
      };

      animId = requestAnimationFrame(drawLoop);
    };

    videoElement.addEventListener('seeked', onSeekedInitial);
  });
}
