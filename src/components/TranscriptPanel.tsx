import { useEffect, useRef } from 'react';
import { Download, FileText, X } from 'lucide-react';
import { Cue, cuesToSrt, cuesToVtt, formatClock } from '../utils/subtitles';

interface Props {
  open: boolean;
  onClose: () => void;
  cues: Cue[];
  currentTime: number;
  onSeek: (t: number) => void;
}

function download(name: string, content: string) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([content], { type: 'text/plain' }));
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
}

export default function TranscriptPanel({ open, onClose, cues, currentTime, onSeek }: Props) {
  const activeRef = useRef<HTMLButtonElement>(null);
  const activeIdx = cues.findIndex((c) => currentTime >= c.start && currentTime < c.end);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [activeIdx]);

  return (
    <aside className={`shrink-0 overflow-hidden transition-all duration-300 ${open ? 'w-80 opacity-100' : 'w-0 opacity-0'}`}>
      <div className="flex h-full w-80 flex-col rounded-lg border border-zinc-800/80 bg-zinc-900/60">
        <div className="flex items-center justify-between border-b border-zinc-800 p-4">
          <h2 className="flex items-center gap-2 font-semibold"><FileText size={16} className="text-accent" /> Transcrição</h2>
          <div className="flex items-center gap-1">
            {cues.length > 0 && (
              <>
                <button id="download-srt" onClick={() => download('legendas.srt', cuesToSrt(cues))} className="flex items-center gap-1 rounded-full px-2 py-1 text-xs text-zinc-400 hover:bg-zinc-800 hover:text-white"><Download size={12} />SRT</button>
                <button id="download-vtt" onClick={() => download('legendas.vtt', cuesToVtt(cues))} className="flex items-center gap-1 rounded-full px-2 py-1 text-xs text-zinc-400 hover:bg-zinc-800 hover:text-white"><Download size={12} />VTT</button>
              </>
            )}
            <button id="transcript-close" onClick={onClose} className="rounded-full p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white"><X size={16} /></button>
          </div>
        </div>
        <div className="flex-1 space-y-1 overflow-y-auto p-2 scrollbar-thin">
          {cues.length === 0 && (
            <p className="p-6 text-center text-sm text-zinc-500">Nenhuma legenda ainda. Gere com IA ou arraste um arquivo .srt/.vtt sobre o player.</p>
          )}
          {cues.map((c, i) => (
            <button key={i} ref={i === activeIdx ? activeRef : undefined} onClick={() => onSeek(c.start)}
              className={`flex w-full gap-3 rounded-lg px-3 py-2 text-left text-sm transition ${
                i === activeIdx ? 'bg-accent-soft text-white' : 'text-zinc-400 hover:bg-zinc-800/70 hover:text-zinc-200'
              }`}>
              <span className={`shrink-0 pt-0.5 font-mono text-xs ${i === activeIdx ? 'text-accent' : 'text-zinc-600'}`}>{formatClock(c.start)}</span>
              <span>{c.text}</span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
