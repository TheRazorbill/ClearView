import { useCallback, useEffect, useRef, useState } from 'react';
import { AlertCircle, Check, Keyboard, Loader2, X } from 'lucide-react';
import DropZone from './components/DropZone';
import VideoPlayer from './components/VideoPlayer';
import StudioInspector, { InspectorTab } from './components/StudioInspector';
import ApiKeyModal, { ApiSettings, loadApiSettings } from './components/ApiKeyModal';
import DocsPage from './pages/DocsPage';
import { Header } from './components/common/Header';
import { VideoExportModal } from './components/common/VideoExportModal';
import { useVideoAudioEnhancer } from './hooks/useVideoAudioEnhancer';
import { useVideoExport } from './hooks/useVideoExport';
import { transcribe, TranscriptionError } from './services/transcriptionService';
import { Cue, parseSubtitles } from './utils/subtitles';
import {
  SAMPLE_CHAPTERS,
  SAMPLE_CUES,
  SAMPLE_VIDEO_TITLE,
  SAMPLE_VIDEO_URL,
} from './utils/sampleData';
import {
  AspectRatioMode,
  Bookmark,
  DEFAULT_SUBTITLE_CONFIG,
  LoopAB,
  SubtitleConfig,
  VIDEO_PRESETS,
  VideoChapter,
  VideoFilterPresetId,
  VideoFilters,
  VideoSummary,
} from './types/playerSettings';
import {
  loadMediaChapters,
  loadMediaSubtitles,
  loadMediaSummary,
  loadSavedAudioConfig,
  loadSavedSubtitleVisualConfig,
  loadSavedVideoConfig,
  saveAllProfile,
  saveAudioConfig,
  saveMediaChapters,
  saveMediaSubtitles,
  saveMediaSummary,
  saveSubtitleVisualConfig,
  saveVideoConfig,
} from './services/playerStorageService';
import { useTranslation } from './i18n/I18nContext';

interface Media {
  src: string;
  name: string;
  file?: File;
  isRemote: boolean;
}

export default function App() {
  const { t } = useTranslation();

  const [currentRoute, setCurrentRoute] = useState<'/' | '/docs'>(() => {
    return window.location.pathname.startsWith('/docs') ? '/docs' : '/';
  });

  const navigateTo = (path: '/' | '/docs') => {
    window.history.pushState(null, '', path);
    setCurrentRoute(path);
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(window.location.pathname.startsWith('/docs') ? '/docs' : '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem('clearview.theme');
      if (saved === 'light' || saved === 'dark') return saved;
      return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    } catch {
      return 'dark';
    }
  });

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    }
    try {
      localStorage.setItem('clearview.theme', theme);
    } catch {
      /* empty */
    }
  }, [theme]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const audio = useVideoAudioEnhancer(videoRef);

  const [media, setMedia] = useState<Media | null>(null);
  const [cues, setCues] = useState<Cue[]>([]);
  const [subtitlesOn, setSubtitlesOn] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);

  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<InspectorTab>('audio');
  const [saveToast, setSaveToast] = useState<string | null>(null);

  useEffect(() => {
    if (!saveToast) return;
    const timer = window.setTimeout(() => setSaveToast(null), 3500);
    return () => window.clearTimeout(timer);
  }, [saveToast]);

  const [videoFilters, setVideoFilters] = useState<VideoFilters>(() => {
    return loadSavedVideoConfig()?.filters ?? VIDEO_PRESETS.normal.filters;
  });
  const [aspectRatio, setAspectRatio] = useState<AspectRatioMode>(() => {
    return loadSavedVideoConfig()?.aspectRatio ?? 'contain';
  });
  const [subtitleConfig, setSubtitleConfig] = useState<SubtitleConfig>(() => {
    return loadSavedSubtitleVisualConfig() ?? DEFAULT_SUBTITLE_CONFIG;
  });

  useEffect(() => {
    const savedAudio = loadSavedAudioConfig();
    if (savedAudio) {
      audio.setAllSettings(savedAudio);
    }
  }, []);

  const [chapters, setChapters] = useState<VideoChapter[]>([]);
  const [summary, setSummary] = useState<VideoSummary | null>(null);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loopAB, setLoopAB] = useState<LoopAB>({ enabled: false, start: null, end: null });

  const [modalOpen, setModalOpen] = useState(false);
  const [api, setApi] = useState<ApiSettings>(loadApiSettings);
  const [progress, setProgress] = useState<{ stage: string; percent?: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    modalOpen: exportModalOpen,
    setModalOpen: setExportModalOpen,
    options: exportOptions,
    setOptions: setExportOptions,
    progress: exportProgress,
    downloadUrl: exportDownloadUrl,
    startExport,
    cancelExport,
    closeModal: closeExportModal,
  } = useVideoExport();

  useEffect(() => {
    if (!media) return;
    const savedSubs = loadMediaSubtitles(media.name);
    if (savedSubs && savedSubs.length) {
      setCues(savedSubs);
    }
    const savedChaps = loadMediaChapters(media.name);
    if (savedChaps && savedChaps.length) {
      setChapters(savedChaps);
    }
    const savedSumm = loadMediaSummary(media.name);
    if (savedSumm) {
      setSummary(savedSumm);
    }
  }, [media]);

  const loadDemoVideo = useCallback(() => {
    setMedia({
      src: SAMPLE_VIDEO_URL,
      name: SAMPLE_VIDEO_TITLE,
      isRemote: true,
    });
    setCues(SAMPLE_CUES);
    setChapters(SAMPLE_CHAPTERS);
    setSubtitlesOn(true);
    setInspectorOpen(false);
  }, []);

  const openFile = (file: File) => {
    const url = URL.createObjectURL(file);
    setMedia({ src: url, name: file.name, file, isRemote: false });
    setCues([]);
    setChapters([]);
    setSummary(null);
    setBookmarks([]);
    setInspectorOpen(false);
  };

  const openUrl = (rawUrl: string) => {
    let finalUrl = rawUrl.trim();
    let name = 'video-remoto.mp4';
    try {
      const parsed = new URL(finalUrl);
      const pathSeg = parsed.pathname.split('/').filter(Boolean).pop();
      if (pathSeg && /\.[a-z0-9]+$/i.test(pathSeg)) name = decodeURIComponent(pathSeg);
    } catch {
      /* empty */
    }
    setMedia({ src: finalUrl, name, isRemote: true });
    setCues([]);
    setChapters([]);
    setSummary(null);
    setBookmarks([]);
    setInspectorOpen(false);
  };

  const loadSubtitleFile = async (file: File) => {
    try {
      const text = await file.text();
      const parsed = parseSubtitles(text);
      if (!parsed.length) throw new Error('Nenhuma legenda valida encontrada.');
      setCues(parsed);
      setSubtitlesOn(true);
      if (media) saveMediaSubtitles(media.name, parsed);
    } catch (e) {
      setError('Erro ao carregar legenda: ' + (e as Error).message);
    }
  };

  const runTranscription = async (settings: ApiSettings) => {
    if (!media) return;
    try {
      setError(null);
      let blob: Blob;
      if (media.file) {
        blob = media.file;
      } else {
        const resp = await fetch(media.src);
        blob = await resp.blob();
      }

      const cuesRes = await transcribe(
        blob,
        {
          provider: settings.provider,
          apiKey: settings.keys[settings.provider],
          language: settings.language || undefined,
        },
        (stage, pct) => setProgress({ stage, percent: pct }),
      );
      setCues(cuesRes);
      setSubtitlesOn(true);
      saveMediaSubtitles(media.name, cuesRes);
    } catch (e) {
      const msg =
        e instanceof TranscriptionError
          ? e.message
          : (e as Error).message || 'Falha na transcricao.';
      setError(msg);
    } finally {
      setProgress(null);
    }
  };

  const handleToggleTab = (tab: InspectorTab) => {
    if (inspectorOpen && activeTab === tab) {
      setInspectorOpen(false);
    } else {
      setActiveTab(tab);
      setInspectorOpen(true);
    }
  };

  const handleAddBookmark = (time: number) => {
    const newBm: Bookmark = {
      id: crypto.randomUUID ? crypto.randomUUID() : `bm-${Date.now()}`,
      time,
      note: '',
      createdAt: Date.now(),
    };
    setBookmarks((prev) => [...prev, newBm].sort((a, b) => a.time - b.time));
  };

  const handleUpdateBookmarkNote = (id: string, note: string) => {
    setBookmarks((prev) => prev.map((b) => (b.id === id ? { ...b, note } : b)));
  };

  const handleDeleteBookmark = (id: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  };

  const handleSetLoopA = () => {
    if (!videoRef.current) return;
    const tCurrent = videoRef.current.currentTime;
    setLoopAB((prev) => ({
      ...prev,
      start: tCurrent,
      enabled: prev.end !== null && tCurrent < prev.end,
    }));
  };

  const handleSetLoopB = () => {
    if (!videoRef.current) return;
    const tCurrent = videoRef.current.currentTime;
    setLoopAB((prev) => ({
      ...prev,
      end: tCurrent,
      enabled: prev.start !== null && prev.start < tCurrent,
    }));
  };

  const handleClearLoopAB = () => {
    setLoopAB({ enabled: false, start: null, end: null });
  };

  const handleApplyVideoPreset = (id: VideoFilterPresetId) => {
    const preset = VIDEO_PRESETS[id];
    if (preset) {
      setVideoFilters({ ...preset.filters });
    }
  };

  const handleSaveAllProfiles = () => {
    saveAllProfile({
      audio: audio.settings,
      video: { filters: videoFilters, aspectRatio },
      subtitleVisual: subtitleConfig,
    });
    setSaveToast(t.storage.allSaved);
  };

  const handleSaveAudioConfig = () => {
    saveAudioConfig(audio.settings);
    setSaveToast(t.storage.audioSaved);
  };

  const handleSaveVideoConfig = () => {
    saveVideoConfig({ filters: videoFilters, aspectRatio });
    setSaveToast(t.storage.videoSaved);
  };

  const handleSaveSubtitleConfig = () => {
    saveSubtitleVisualConfig(subtitleConfig);
    setSaveToast(t.storage.subtitlesSaved);
  };

  if (currentRoute === '/docs') {
    return (
      <DocsPage
        onNavigateHome={() => navigateTo('/')}
        theme={theme}
        onToggleTheme={() => setTheme((tCurrent) => (tCurrent === 'dark' ? 'light' : 'dark'))}
      />
    );
  }

  return (
    <div className="flex h-full flex-col bg-zinc-950 text-zinc-100 antialiased selection:bg-zinc-800 selection:text-white">
      <Header
        currentRoute={currentRoute}
        onNavigateHome={() => {
          navigateTo('/');
          setMedia(null);
          setInspectorOpen(false);
        }}
        onNavigateDocs={() => navigateTo('/docs')}
        theme={theme}
        onToggleTheme={() => setTheme((tCurrent) => (tCurrent === 'dark' ? 'light' : 'dark'))}
        mediaName={media?.name}
        hasMedia={!!media}
        onNewVideo={() => setMedia(null)}
        onOpenAiModal={() => setModalOpen(true)}
        aiProgress={progress?.stage}
        inspectorOpen={inspectorOpen}
        activeTab={activeTab}
        onToggleTab={handleToggleTab}
        onOpenExportModal={() => setExportModalOpen(true)}
      />

      <main
        className={`flex min-h-0 flex-1 p-3 sm:p-5 md:p-6 ${
          !media ? 'overflow-y-auto scrollbar-thin' : 'overflow-hidden'
        }`}
      >
        {!media ? (
          <div className="my-auto flex flex-col items-center gap-4 sm:gap-5 max-w-4xl mx-auto w-full py-2 px-1">
            <div className="text-center animate-fade-up space-y-1.5 sm:space-y-2">
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-100 md:text-4xl pt-1">
                Player Multimidia Profissional.
              </h2>
              <p className="mx-auto max-w-xl text-xs sm:text-sm text-zinc-400">
                Restauracao de audio em tempo real, equalizador, matriz mono L/R, calibracao de
                imagem, capitulos automaticos e analise com IA.
              </p>
            </div>

            <DropZone
              onFile={openFile}
              onUrl={openUrl}
              onError={setError}
              onLoadDemo={loadDemoVideo}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 w-full text-xs">
              <div className="rounded-md border border-zinc-900 bg-zinc-950/60 p-2.5 sm:p-3 space-y-1">
                <span className="font-semibold text-zinc-200">Audio e Equalizador</span>
                <p className="text-zinc-500 text-[11px]">
                  Passa-Altas, Notch 60Hz, De-Hiss, EQ 5 bandas, Downmix Mono e Noise Gate.
                </p>
              </div>
              <div className="rounded-md border border-zinc-900 bg-zinc-950/60 p-2.5 sm:p-3 space-y-1">
                <span className="font-semibold text-zinc-200">Video FX e Lupa</span>
                <p className="text-zinc-500 text-[11px]">
                  Brilho, contraste, P&B, sepia, proporcao 16:9/4:3 e Zoom/Pan interativo.
                </p>
              </div>
              <div className="rounded-md border border-zinc-900 bg-zinc-950/60 p-2.5 sm:p-3 space-y-1">
                <span className="font-semibold text-zinc-200">IA de Conteudo</span>
                <p className="text-zinc-500 text-[11px]">
                  Capitulos automaticos, resumo executivo, traducao e Q&A direto no video.
                </p>
              </div>
              <div className="rounded-md border border-zinc-900 bg-zinc-950/60 p-2.5 sm:p-3 space-y-1">
                <span className="font-semibold text-zinc-200">Exportacao e Estudo</span>
                <p className="text-zinc-500 text-[11px]">
                  Exportacao de video com audio e legenda, Loop A-B, marcadores e atalhos.
                </p>
              </div>
            </div>

            <div className="hidden sm:flex flex-wrap justify-center gap-x-4 gap-y-1.5 text-xs text-zinc-500 border-t border-zinc-900 pt-3">
              <span className="flex items-center gap-1.5 text-zinc-400">
                <Keyboard size={13} /> Atalhos:
              </span>
              {[
                ['Espaco', 'Play/Pause'],
                ['J / L', '±10s'],
                ['[ / ]', 'Velocidade'],
                ['< / > ( , e . )', 'Frame ±1'],
                ['B', 'Marcador'],
                ['S', 'Screenshot'],
                ['P', 'PiP'],
                ['C', 'Legendas'],
              ].map(([k, d]) => (
                <span key={k}>
                  <kbd className="rounded bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 font-mono text-[11px] text-zinc-300">
                    {k}
                  </kbd>{' '}
                  {d}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="relative flex h-full w-full gap-3 sm:gap-4 min-w-0 overflow-hidden">
            <section className="flex min-w-0 flex-1 flex-col items-center justify-center gap-3 h-full overflow-hidden">
              <VideoPlayer
                videoRef={videoRef}
                src={media.src}
                mediaKey={media.name}
                isRemote={media.isRemote}
                cues={cues}
                chapters={chapters}
                bookmarks={bookmarks}
                onAddBookmark={handleAddBookmark}
                subtitlesOn={subtitlesOn}
                subtitleConfig={subtitleConfig}
                videoFilters={videoFilters}
                aspectRatio={aspectRatio}
                loopAB={loopAB}
                onSetLoopA={handleSetLoopA}
                onSetLoopB={handleSetLoopB}
                onClearLoopAB={handleClearLoopAB}
                onToggleSubtitles={() => setSubtitlesOn((s) => !s)}
                onSubtitleFile={loadSubtitleFile}
                onUserGesture={audio.ensureStarted}
                onTimeUpdate={setCurrentTime}
                onError={setError}
                onOpenSubtitleSettings={() => {
                  setActiveTab('subtitles');
                  setInspectorOpen(true);
                }}
                onOpenVideoFilterSettings={() => {
                  setActiveTab('video');
                  setInspectorOpen(true);
                }}
                onOpenStudioTab={(tab) => {
                  setActiveTab(tab);
                  setInspectorOpen(true);
                }}
                onOpenExportModal={() => setExportModalOpen(true)}
              />

              {progress && (
                <div className="w-full max-w-xl animate-fade-up bg-zinc-900 border border-zinc-800 p-3 rounded-md">
                  <div className="mb-1.5 flex justify-between text-xs text-zinc-300">
                    <span className="flex items-center gap-1.5">
                      <Loader2 size={12} className="animate-spin text-zinc-100" />
                      {progress.stage}
                    </span>
                    {typeof progress.percent === 'number' && (
                      <span className="font-mono text-zinc-400">
                        {Math.round(progress.percent)}%
                      </span>
                    )}
                  </div>
                  {typeof progress.percent === 'number' && (
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
                      <div
                        className="h-full bg-zinc-100 transition-all duration-300"
                        style={{ width: `${progress.percent}%` }}
                      />
                    </div>
                  )}
                </div>
              )}
            </section>

            <StudioInspector
              open={inspectorOpen}
              isOpen={inspectorOpen}
              onClose={() => setInspectorOpen(false)}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              audio={audio}
              videoFilters={videoFilters}
              onFilterChange={(key: keyof VideoFilters, val: number) =>
                setVideoFilters((prev) => ({ ...prev, [key]: val }))
              }
              aspectRatio={aspectRatio}
              onAspectRatioChange={setAspectRatio}
              onApplyVideoPreset={handleApplyVideoPreset}
              cues={cues}
              onCuesChange={(newCues: Cue[]) => {
                setCues(newCues);
                if (media) saveMediaSubtitles(media.name, newCues);
              }}
              currentTime={currentTime}
              onSeek={(tSeek: number) => {
                if (videoRef.current) videoRef.current.currentTime = tSeek;
              }}
              subtitleConfig={subtitleConfig}
              onSubtitleConfigChange={setSubtitleConfig}
              onSaveAllProfiles={handleSaveAllProfiles}
              onSaveAudioConfig={handleSaveAudioConfig}
              onSaveVideoConfig={handleSaveVideoConfig}
              onSaveSubtitleConfig={handleSaveSubtitleConfig}
              chapters={chapters}
              onChaptersChange={(ch: VideoChapter[]) => {
                setChapters(ch);
                if (media) saveMediaChapters(media.name, ch);
              }}
              summary={summary}
              onSummaryChange={(summ: VideoSummary) => {
                setSummary(summ);
                if (media) saveMediaSummary(media.name, summ);
              }}
              aiContext={{
                provider: api.provider,
                apiKey: api.keys[api.provider],
                language: api.language || undefined,
              }}
              bookmarks={bookmarks}
              onAddBookmark={handleAddBookmark}
              onUpdateBookmarkNote={handleUpdateBookmarkNote}
              onDeleteBookmark={handleDeleteBookmark}
            />
          </div>
        )}
      </main>

      {saveToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-md border border-zinc-800 bg-zinc-900/95 px-4 py-2.5 text-xs font-medium text-zinc-100 shadow-2xl backdrop-blur-md animate-fade-up">
          <Check size={14} className="text-emerald-400" />
          <span>{saveToast}</span>
        </div>
      )}

      <ApiKeyModal
        open={modalOpen}
        initial={api}
        onClose={() => setModalOpen(false)}
        onSave={(s, start) => {
          setApi(s);
          setModalOpen(false);
          if (start) runTranscription(s);
        }}
      />

      {media && (
        <VideoExportModal
          open={exportModalOpen}
          onClose={closeExportModal}
          options={exportOptions}
          setOptions={setExportOptions}
          progress={exportProgress}
          downloadUrl={exportDownloadUrl}
          onStartExport={() => {
            if (!videoRef.current || !media) return;
            startExport({
              videoElement: videoRef.current,
              videoFilters,
              subtitleConfig,
              cues,
              loopStart: loopAB.start,
              loopEnd: loopAB.end,
              audioDestinationNode: audio.getExportDestinationNode() || undefined,
            });
          }}
          onCancelExport={cancelExport}
          hasLoopAB={loopAB.enabled && loopAB.start !== null && loopAB.end !== null}
          hasSubtitles={cues.length > 0}
        />
      )}

      {error && (
        <div
          role="alert"
          className="fixed bottom-6 left-1/2 z-50 flex max-w-lg -translate-x-1/2 items-start gap-3 rounded-md border border-red-500/30 bg-zinc-900/95 px-4 py-3 text-sm shadow-2xl animate-fade-up"
        >
          <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-400" />
          <span className="text-zinc-200">{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-zinc-500 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
