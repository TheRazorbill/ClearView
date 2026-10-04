import React from 'react';
import { BookmarkCheck, BookmarkPlus, Download, Play, Trash2 } from 'lucide-react';
import { Bookmark } from '../../../types/playerSettings';
import { formatClock } from '../../../utils/subtitles';
import { useTranslation } from '../../../i18n/I18nContext';

interface BookmarksTabProps {
  bookmarks: Bookmark[];
  currentTime: number;
  onSeek: (t: number) => void;
  onAddBookmark: (time: number) => void;
  onUpdateBookmarkNote: (id: string, note: string) => void;
  onDeleteBookmark: (id: string) => void;
}

function downloadFile(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function BookmarksTab({
  bookmarks,
  currentTime,
  onSeek,
  onAddBookmark,
  onUpdateBookmarkNote,
  onDeleteBookmark,
}: BookmarksTabProps) {
  const { t } = useTranslation();

  const handleExportBookmarks = () => {
    const md = bookmarks
      .map((b) => `- **${formatClock(b.time)}**: ${b.note || 'Ponto de interesse'}`)
      .join('\n');
    downloadFile('anotacoes-video.md', `# Anotacoes do Video\n\n${md}`);
  };

  return (
    <div
      className="space-y-4 animate-fade-up"
      role="tabpanel"
      id="panel-bookmarks"
      aria-labelledby="tab-bookmarks"
    >
      {/* Header with Quick Add and Export */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onAddBookmark(currentTime)}
          className="flex items-center gap-1.5 rounded bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-950 hover:bg-white transition active:scale-95"
        >
          <BookmarkPlus size={13} />
          <span>{t.inspector.bookmarks.addMarker}</span>
        </button>

        {bookmarks.length > 0 && (
          <button
            onClick={handleExportBookmarks}
            className="flex items-center gap-1 rounded border border-zinc-900 bg-zinc-950/80 px-2 py-1 text-xs text-zinc-400 hover:border-zinc-800 hover:text-white transition"
          >
            <Download size={11} />
            <span>{t.inspector.bookmarks.exportMarkdown}</span>
          </button>
        )}
      </div>

      {/* Bookmarks List */}
      {bookmarks.length === 0 ? (
        <div className="rounded-md border border-zinc-900 bg-zinc-950/40 p-8 text-center text-xs text-zinc-500">
          <BookmarkCheck size={20} className="mx-auto mb-2 text-zinc-600" />
          <p>{t.inspector.bookmarks.noBookmarks}</p>
        </div>
      ) : (
        <div className="max-h-[460px] overflow-y-auto space-y-2 scrollbar-thin">
          {bookmarks.map((b) => (
            <div
              key={b.id}
              className="rounded-md border border-zinc-900 bg-zinc-950/80 p-2.5 space-y-2 transition hover:border-zinc-800"
            >
              <div className="flex items-center justify-between">
                <button
                  onClick={() => onSeek(b.time)}
                  className="flex items-center gap-1.5 font-mono text-xs font-semibold text-amber-400 hover:text-amber-300"
                >
                  <Play size={10} />
                  <span>{formatClock(b.time)}</span>
                </button>
                <button
                  onClick={() => onDeleteBookmark(b.id)}
                  className="text-zinc-600 hover:text-red-400 transition"
                  title={t.inspector.bookmarks.deleteMarker}
                  aria-label={t.inspector.bookmarks.deleteMarker}
                >
                  <Trash2 size={12} />
                </button>
              </div>
              <input
                type="text"
                value={b.note}
                onChange={(e) => onUpdateBookmarkNote(b.id, e.target.value)}
                placeholder={t.inspector.bookmarks.notePlaceholder}
                className="w-full rounded bg-zinc-900/60 border border-zinc-850 px-2 py-1 text-xs text-zinc-200 outline-none focus:border-zinc-700"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
