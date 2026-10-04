import { useEffect, useRef } from 'react';

interface Props {
  analyser: AnalyserNode | null;
  isActive: boolean;
}

export default function AudioVisualizer({ analyser, isActive }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const bufferLength = analyser ? analyser.frequencyBinCount : 64;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      animId = requestAnimationFrame(render);
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      ctx.strokeStyle = 'rgba(39, 39, 42, 0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      if (!analyser || !isActive) {
        ctx.strokeStyle = 'rgba(113, 113, 122, 0.5)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, height - 4);
        ctx.lineTo(width, height - 4);
        ctx.stroke();
        return;
      }

      analyser.getByteFrequencyData(dataArray);

      const barCount = 36;
      const barWidth = width / barCount - 1.5;
      const step = Math.floor(dataArray.length / barCount);

      for (let i = 0; i < barCount; i++) {
        const val = dataArray[i * step] || 0;
        const percent = val / 255;
        const barHeight = Math.max(2, percent * (height - 6));
        const x = i * (barWidth + 1.5);
        const y = height - barHeight;

        const alpha = Math.min(1, 0.35 + percent * 0.65);
        ctx.fillStyle = `rgba(244, 244, 245, ${alpha})`;
        ctx.fillRect(x, y, barWidth, barHeight);
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [analyser, isActive]);

  return (
    <div className="rounded-md border border-zinc-900 bg-zinc-950 p-2.5 space-y-1">
      <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
        <span>20 Hz</span>
        <span>Espectro FFT em Tempo Real</span>
        <span>20 kHz</span>
      </div>
      <canvas ref={canvasRef} width={320} height={56} className="w-full rounded bg-zinc-950/80" />
    </div>
  );
}
