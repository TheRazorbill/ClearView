import React from 'react';
import {
  AudioLines,
  BookOpen,
  BookmarkCheck,
  Captions,
  Download,
  FolderOpen,
  Globe,
  Loader2,
  Moon,
  SlidersHorizontal,
  Sparkles,
  Sun,
  SunMedium,
  Type,
} from 'lucide-react';
import { InspectorTab } from '../inspector/StudioInspector';
import { useTranslation } from '../../i18n/I18nContext';

interface HeaderProps {
  currentRoute: '/' | '/docs';
  onNavigateHome: () => void;
  onNavigateDocs: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  mediaName?: string;
  hasMedia: boolean;
  onNewVideo?: () => void;
  onOpenAiModal?: () => void;
  aiProgress?: string | null;
  inspectorOpen: boolean;
  activeTab: InspectorTab;
  onToggleTab: (tab: InspectorTab) => void;
  onOpenExportModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRoute,
  onNavigateHome,
  onNavigateDocs,
  theme,
  onToggleTheme,
  mediaName,
  hasMedia,
  onNewVideo,
  onOpenAiModal,
  aiProgress,
  inspectorOpen,
  activeTab,
  onToggleTab,
  onOpenExportModal,
}) => {
  const { locale, setLocale, t } = useTranslation();

  const toggleLanguage = () => {
    setLocale(locale === 'pt' ? 'en' : 'pt');
  };

  return (
    <header
      role="banner"
      className="flex items-center gap-2 sm:gap-3 px-3 sm:px-6 py-2 sm:py-3 border-b border-zinc-900 bg-zinc-950 shrink-0"
    >
      <button
        id="btn-logo-home"
        type="button"
        onClick={onNavigateHome}
        aria-label="Ir para a tela inicial"
        className="flex items-center gap-2 sm:gap-2.5 text-left transition hover:opacity-85 focus:outline-none cursor-pointer shrink-0"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-100 text-zinc-950 font-bold shrink-0">
          <AudioLines size={15} />
        </div>
        <div className="flex items-baseline gap-1.5 sm:gap-2">
          <h1 className="text-sm font-semibold tracking-tight text-zinc-100">ClearView</h1>
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest hidden sm:inline">
            Studio Player
          </span>
        </div>
      </button>

      {hasMedia && mediaName && (
        <span className="ml-2 hidden max-w-xs md:max-w-sm truncate text-xs text-zinc-400 border-l border-zinc-800 pl-3 md:block font-mono">
          {mediaName}
        </span>
      )}

      <div className="flex-1" />

      <nav
        role="navigation"
        aria-label="Navegacao principal e ferramentas"
        className="flex items-center gap-1 sm:gap-1.5 text-xs overflow-x-auto no-scrollbar py-0.5"
      >
        <button
          id="btn-toggle-lang"
          type="button"
          onClick={toggleLanguage}
          aria-label={t.common.language}
          className="flex items-center gap-1 rounded-md px-2 py-1.5 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100 transition shrink-0 font-mono text-[11px]"
          title={locale === 'pt' ? 'Mudar para ingles' : 'Switch to Portuguese'}
        >
          <Globe size={13} />
          <span className="uppercase font-semibold">{locale}</span>
        </button>

        <button
          id="btn-toggle-theme"
          type="button"
          onClick={onToggleTheme}
          aria-label={theme === 'dark' ? t.common.lightTheme : t.common.darkTheme}
          className="flex items-center gap-1.5 rounded-md px-2 sm:px-2.5 py-1.5 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100 transition shrink-0"
          title={theme === 'dark' ? t.common.lightTheme : t.common.darkTheme}
        >
          {theme === 'dark' ? <Sun size={13} /> : <Moon size={13} />}
          <span className="hidden sm:inline">
            {theme === 'dark' ? t.common.lightTheme : t.common.darkTheme}
          </span>
        </button>

        <button
          id="btn-nav-docs"
          type="button"
          onClick={currentRoute === '/docs' ? onNavigateHome : onNavigateDocs}
          aria-label={currentRoute === '/docs' ? 'Voltar ao reprodutor' : t.common.docs}
          className="flex items-center gap-1.5 rounded-md px-2 sm:px-2.5 py-1.5 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100 transition shrink-0"
          title={
            currentRoute === '/docs'
              ? 'Voltar ao reprodutor'
              : 'Acessar rota de documentacao (/docs)'
          }
        >
          <BookOpen size={13} />
          <span className="font-mono">{currentRoute === '/docs' ? 'Player' : '/docs'}</span>
        </button>

        {hasMedia && (
          <>
            <div className="h-4 w-px bg-zinc-800 mx-0.5 sm:mx-1 shrink-0" />

            {onOpenAiModal && (
              <button
                id="btn-ai-subs"
                type="button"
                disabled={!!aiProgress}
                onClick={onOpenAiModal}
                className="flex items-center gap-1.5 rounded-md bg-zinc-100 px-2 sm:px-3 py-1.5 font-medium text-zinc-950 transition hover:bg-white active:scale-95 disabled:opacity-50 shrink-0"
              >
                {aiProgress ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Captions size={13} />
                )}
                <span className="hidden sm:inline">Legendas IA</span>
              </button>
            )}

            {onOpenExportModal && (
              <button
                id="btn-header-export"
                type="button"
                onClick={onOpenExportModal}
                aria-label={t.export.title}
                className="flex items-center gap-1.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 sm:px-2.5 py-1.5 font-medium hover:bg-emerald-500/20 transition shrink-0"
                title={t.export.button}
              >
                <Download size={13} />
                <span className="hidden sm:inline">{t.export.button}</span>
              </button>
            )}

            <button
              id="btn-toggle-audio"
              type="button"
              onClick={() => onToggleTab('audio')}
              className={`flex items-center gap-1.5 rounded-md px-2 sm:px-2.5 py-1.5 transition shrink-0 ${
                inspectorOpen && activeTab === 'audio'
                  ? 'bg-zinc-200 text-zinc-950 font-medium'
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
              }`}
            >
              <SlidersHorizontal size={13} />
              <span className="hidden md:inline">{t.tabs.audio}</span>
            </button>

            <button
              id="btn-toggle-video"
              type="button"
              onClick={() => onToggleTab('video')}
              className={`flex items-center gap-1.5 rounded-md px-2 sm:px-2.5 py-1.5 transition shrink-0 ${
                inspectorOpen && activeTab === 'video'
                  ? 'bg-zinc-200 text-zinc-950 font-medium'
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
              }`}
            >
              <SunMedium size={13} />
              <span className="hidden md:inline">{t.tabs.video}</span>
            </button>

            <button
              id="btn-toggle-subtitles"
              type="button"
              onClick={() => onToggleTab('subtitles')}
              className={`flex items-center gap-1.5 rounded-md px-2 sm:px-2.5 py-1.5 transition shrink-0 ${
                inspectorOpen && activeTab === 'subtitles'
                  ? 'bg-zinc-200 text-zinc-950 font-medium'
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
              }`}
            >
              <Type size={13} />
              <span className="hidden md:inline">{t.tabs.subtitles}</span>
            </button>

            <button
              id="btn-toggle-ai"
              type="button"
              onClick={() => onToggleTab('ai')}
              className={`flex items-center gap-1.5 rounded-md px-2 sm:px-2.5 py-1.5 transition shrink-0 ${
                inspectorOpen && activeTab === 'ai'
                  ? 'bg-zinc-200 text-zinc-950 font-medium'
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
              }`}
            >
              <Sparkles size={13} />
              <span className="hidden md:inline">{t.tabs.ai}</span>
            </button>

            <button
              id="btn-toggle-bookmarks"
              type="button"
              onClick={() => onToggleTab('bookmarks')}
              className={`flex items-center gap-1.5 rounded-md px-2 sm:px-2.5 py-1.5 transition shrink-0 ${
                inspectorOpen && activeTab === 'bookmarks'
                  ? 'bg-zinc-200 text-zinc-950 font-medium'
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
              }`}
            >
              <BookmarkCheck size={13} />
              <span className="hidden md:inline">{t.tabs.bookmarks}</span>
            </button>

            {onNewVideo && (
              <button
                id="btn-new-video"
                type="button"
                onClick={onNewVideo}
                title="Abrir outro video"
                aria-label="Abrir outro video"
                className="rounded-md p-1.5 text-zinc-500 hover:bg-zinc-900 hover:text-white transition ml-1 shrink-0"
              >
                <FolderOpen size={15} />
              </button>
            )}
          </>
        )}
      </nav>
    </header>
  );
};
