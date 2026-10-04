import { useRef, useState } from 'react';
import { Film, Link2, Sparkles, Upload } from 'lucide-react';
import { useTranslation } from '../i18n/I18nContext';

const VIDEO_EXT = /\.(mp4|mkv|webm|mov|m4v)$/i;

interface Props {
  onFile: (file: File) => void;
  onUrl: (url: string) => void;
  onError: (msg: string) => void;
  onLoadDemo?: () => void;
}

export default function DropZone({ onFile, onUrl, onError, onLoadDemo }: Props) {
  const { t } = useTranslation();
  const [dragging, setDragging] = useState(false);
  const [url, setUrl] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handle = (file?: File) => {
    if (!file) return;
    if (!VIDEO_EXT.test(file.name) && !file.type.startsWith('video/')) {
      onError('Formato nao suportado. Use .mp4, .mkv, .webm ou .mov.');
      return;
    }
    onFile(file);
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-3.5 sm:gap-4 animate-fade-up">
      <div
        id="dropzone"
        role="button"
        tabIndex={0}
        aria-label={t.dropzone.dragPrompt}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handle(e.dataTransfer.files[0]);
        }}
        onClick={() => inputRef.current?.click()}
        className={`group relative flex cursor-pointer flex-col items-center justify-center gap-2.5 sm:gap-3.5 overflow-hidden rounded-lg border-2 border-dashed px-4 sm:px-8 py-7 sm:py-10 text-center transition-all duration-300 ${
          dragging
            ? 'scale-[1.01] border-accent bg-accent-soft'
            : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-600 hover:bg-zinc-900/70'
        }`}
      >
        <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-lg bg-zinc-800 text-accent">
          {dragging ? (
            <Upload size={24} className="sm:size-6" />
          ) : (
            <Film size={24} className="sm:size-6" />
          )}
        </div>
        <div>
          <p className="text-base sm:text-lg font-semibold">{t.dropzone.dragPrompt}</p>
          <p className="mt-1 text-xs sm:text-sm text-zinc-400">{t.dropzone.clickPrompt}</p>
        </div>
        <input
          ref={inputRef}
          id="file-input"
          type="file"
          accept="video/*,.mkv"
          hidden
          onChange={(e) => handle(e.target.files?.[0])}
        />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (url.trim()) onUrl(url.trim());
        }}
        className="flex items-center gap-2 rounded-md border border-zinc-800 bg-zinc-900/60 p-1.5 pl-3 sm:pl-4 focus-within:border-zinc-600"
      >
        <Link2 size={16} className="shrink-0 text-zinc-500" />
        <input
          id="url-input"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder={t.dropzone.urlPlaceholder}
          aria-label={t.dropzone.urlPlaceholder}
          className="min-w-0 flex-1 bg-transparent text-xs sm:text-sm outline-none placeholder:text-zinc-500"
        />
        <button
          id="url-submit"
          type="submit"
          className="rounded-md bg-accent px-3.5 sm:px-5 py-2 text-xs sm:text-sm font-semibold text-zinc-950 transition hover:brightness-110 active:scale-95 shrink-0"
        >
          {t.dropzone.openButton}
        </button>
      </form>

      {onLoadDemo && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 rounded-lg border border-zinc-800/80 bg-zinc-950/50 p-3 sm:px-4 sm:py-3 text-xs">
          <div className="flex items-center gap-2 text-zinc-300">
            <Sparkles size={16} className="text-amber-400 shrink-0" />
            <span>{t.demo.bannerTitle}</span>
          </div>
          <button
            type="button"
            id="btn-load-demo"
            onClick={onLoadDemo}
            className="w-full sm:w-auto rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-100 px-3 py-1.5 font-medium transition"
          >
            {t.demo.loadButton}
          </button>
        </div>
      )}
    </div>
  );
}
