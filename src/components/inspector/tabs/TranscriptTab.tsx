import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Download, Search } from 'lucide-react';
import { Cue, cuesToSrt, cuesToVtt, formatClock } from '../../../utils/subtitles';
import { useTranslation } from '../../../i18n/I18nContext';

interface TranscriptTabProps {
  cues: Cue[];
  currentTime: number;
  onSeek: (t: number) => void;
}

function downloadFile(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function TranscriptTab({ cues, currentTime, onSeek }: TranscriptTabProps) {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const activeRef = useRef<HTMLButtonElement>(null);

  const filteredCues = useMemo(() => {
    if (!search.trim()) return cues;
    const q = search.toLowerCase();
    return cues.filter((c) => c.text.toLowerCase().includes(q));
  }, [cues, search]);

  const activeIdx = useMemo(() => {
    return cues.findIndex((c) => currentTime >= c.start && currentTime < c.end);
  }, [cues, currentTime]);

  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [activeIdx]);

  return (
    <div className="space-y-3 animate-fade-up" role="tabpanel" id="panel-transcript" aria-labelledby="tab-transcript">
      {/* Quick Search */}
      <div className="relative">
        <Search size={13} className="absolute left-2.5 top-2.5 text-zinc-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t.inspector.transcript.searchPlaceholder}
          className="w-full rounded-md border border-zinc-900 bg-zinc-950/80 py-1.5 pl-8 pr-2.5 text-xs text-zinc-200 outline-none placeholder:text-zinc-600 focus:border-zinc-700"
        />
      </div>

      {/* Export Options */}
      {cues.length > 0 && (
        <div className="flex gap-2">
          <button
            onClick={() => downloadFile('legendas.srt', cuesToSrt(cues))}
            className="flex flex-1 items-center justify-center gap-1.5 rounded border border-zinc-900 bg-zinc-950/80 py-1.5 text-xs text-zinc-300 hover:border-zinc-800 hover:text-white transition"
          >
            <Download size={12} />
            <span>{t.inspector.transcript.downloadSrt}</span>
          </button>
          <button
            onClick={() => downloadFile('legendas.vtt', cuesToVtt(cues))}
            className="flex flex-1 items-center justify-center gap-1.5 rounded border border-zinc-900 bg-zinc-950/80 py-1.5 text-xs text-zinc-300 hover:border-zinc-800 hover:text-white transition"
          >
            <Download size={12} />
            <span>{t.inspector.transcript.downloadVtt}</span>
          </button>
        </div>
      )}

      {/* Interactive Cues Stream */}
      <div className="max-h-[460px] overflow-y-auto space-y-1 scrollbar-thin">
        {filteredCues.length === 0 ? (
          <p className="p-8 text-center text-xs text-zinc-500">{t.inspector.transcript.noCuesFound}</p>
        ) : (
          filteredCues.map((c, i) => {
            const isActive = i === activeIdx;
            return (
              <button
                key={i}
                ref={isActive ? activeRef : undefined}
                onClick={() => onSeek(c.start)}
                className={`flex w-full items-start gap-2.5 rounded-md p-2 text-left text-xs transition ${
                  isActive
                    ? 'bg-zinc-100 font-medium text-zinc-950 shadow-sm'
                    : 'text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-200'
                }`}
              >
                <span
                  className={`mt-0.5 shrink-0 rounded px-1 py-0.5 font-mono text-[10px] ${
                    isActive ? 'bg-zinc-200 text-zinc-900 font-bold' : 'bg-zinc-900 text-zinc-500'
                  }`}
                >
                  {formatClock(c.start)}
                </span>
                <span className="leading-snug">{c.text}</span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
