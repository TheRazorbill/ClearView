import React from 'react';
import {
  AudioLines,
  BookmarkCheck,
  Captions,
  FileText,
  Save,
  Sparkles,
  SunMedium,
  X,
} from 'lucide-react';
import { AudioSettings, PresetId, useVideoAudioEnhancer } from '../../hooks/useVideoAudioEnhancer';
import {
  AspectRatioMode,
  Bookmark,
  SubtitleConfig,
  VideoChapter,
  VideoFilterPresetId,
  VideoFilters,
  VideoSummary,
} from '../../types/playerSettings';
import { Cue } from '../../utils/subtitles';
import { TranscriptionConfig } from '../../services/transcriptionService';
import AudioTab from './tabs/AudioTab';
import VideoTab from './tabs/VideoTab';
import SubtitlesTab from './tabs/SubtitlesTab';
import TranscriptTab from './tabs/TranscriptTab';
import AiTab from './tabs/AiTab';
import BookmarksTab from './tabs/BookmarksTab';
import { useTranslation } from '../../i18n/I18nContext';

export type InspectorTab = 'audio' | 'video' | 'subtitles' | 'transcript' | 'ai' | 'bookmarks';

export interface StudioInspectorProps {
  open?: boolean;
  isOpen?: boolean;
  activeTab: InspectorTab;
  onTabChange: (tab: InspectorTab) => void;
  onClose: () => void;
  onOpenApiKeyModal?: () => void;

  onSaveAudio?: () => void;
  onSaveVideo?: () => void;
  onSaveSubtitles?: () => void;
  onSaveAll?: () => void;
  onSaveAudioConfig?: () => void;
  onSaveVideoConfig?: () => void;
  onSaveSubtitleConfig?: () => void;
  onSaveAllProfiles?: () => void;

  audio?: ReturnType<typeof useVideoAudioEnhancer>;
  audioSettings?: AudioSettings;
  activeAudioPreset?: PresetId | null;
  onChangeAudio?: <K extends keyof AudioSettings>(k: K, v: AudioSettings[K]) => void;
  onPresetAudio?: (id: PresetId) => void;
  audioError?: string | null;
  analyser?: AnalyserNode | null;

  videoFilters: VideoFilters;
  onChangeVideoFilter?: <K extends keyof VideoFilters>(k: K, v: VideoFilters[K]) => void;
  onFilterChange?: <K extends keyof VideoFilters>(k: K, v: VideoFilters[K]) => void;
  onResetVideoFilters?: () => void;
  onApplyVideoPreset: (id: VideoFilterPresetId) => void;
  aspectRatio: AspectRatioMode;
  onChangeAspectRatio?: (mode: AspectRatioMode) => void;
  onAspectRatioChange?: (mode: AspectRatioMode) => void;

  subtitleConfig: SubtitleConfig;
  onChangeSubtitleConfig?: <K extends keyof SubtitleConfig>(k: K, v: SubtitleConfig[K]) => void;
  onSubtitleConfigChange?:
    React.Dispatch<React.SetStateAction<SubtitleConfig>> | ((config: SubtitleConfig) => void);
  onResetSubtitleConfig?: () => void;
  onUpdateCues?: (cues: Cue[]) => void;
  onCuesChange?: (cues: Cue[]) => void;

  cues: Cue[];
  currentTime: number;
  onSeek: (t: number) => void;

  chapters: VideoChapter[];
  onSetChapters?: (chapters: VideoChapter[]) => void;
  onChaptersChange?: (chapters: VideoChapter[]) => void;
  summary: VideoSummary | null;
  onSetSummary?: (summary: VideoSummary) => void;
  onSummaryChange?: (summary: VideoSummary) => void;
  apiConfig?: TranscriptionConfig;
  aiContext?: TranscriptionConfig;

  bookmarks: Bookmark[];
  onAddBookmark: (time: number) => void;
  onUpdateBookmarkNote: (id: string, note: string) => void;
  onDeleteBookmark: (id: string) => void;
}

export default function StudioInspector({
  open,
  isOpen,
  activeTab,
  onTabChange,
  onClose,
  onOpenApiKeyModal,
  onSaveAudio,
  onSaveVideo,
  onSaveSubtitles,
  onSaveAll,
  onSaveAudioConfig,
  onSaveVideoConfig,
  onSaveSubtitleConfig,
  onSaveAllProfiles,
  audio,
  audioSettings,
  activeAudioPreset,
  onChangeAudio,
  onPresetAudio,
  audioError,
  analyser,
  videoFilters,
  onChangeVideoFilter,
  onFilterChange,
  onResetVideoFilters,
  onApplyVideoPreset,
  aspectRatio,
  onChangeAspectRatio,
  onAspectRatioChange,
  subtitleConfig,
  onChangeSubtitleConfig,
  onSubtitleConfigChange,
  onResetSubtitleConfig,
  onUpdateCues,
  onCuesChange,
  cues,
  currentTime,
  onSeek,
  chapters,
  onSetChapters,
  onChaptersChange,
  summary,
  onSetSummary,
  onSummaryChange,
  apiConfig,
  aiContext,
  bookmarks,
  onAddBookmark,
  onUpdateBookmarkNote,
  onDeleteBookmark,
}: StudioInspectorProps) {
  const { t } = useTranslation();

  const isVisible = Boolean(open ?? isOpen);

  const resolvedAudioSettings: AudioSettings = audio
    ? audio.settings
    : audioSettings || {
        highPassFreq: 20,
        lowPassFreq: 20000,
        notchFreq: 0,
        speechBoost: 0,
        speechFreq: 3000,
        compression: 0,
        volume: 1,
        noiseGate: false,
        gateThreshold: -45,
        channelMode: 'stereo',
        equalizer: { sub60: 0, low250: 0, mid1k: 0, pres4k: 0, high12k: 0 },
        smartSilenceSkip: false,
      };
  const resolvedActiveAudioPreset = audio ? audio.activePreset : (activeAudioPreset ?? null);
  const resolvedOnChangeAudio = audio ? audio.setSetting : onChangeAudio || (() => {});
  const resolvedOnPresetAudio = audio ? audio.applyPreset : onPresetAudio || (() => {});
  const resolvedAudioError = audio ? audio.error : (audioError ?? null);
  const resolvedAnalyser = audio ? audio.analyserRef : (analyser ?? null);

  const resolvedOnFilterChange = <K extends keyof VideoFilters>(k: K, v: VideoFilters[K]) => {
    if (onChangeVideoFilter) onChangeVideoFilter(k, v);
    if (onFilterChange) onFilterChange(k, v);
  };
  const resolvedOnAspectRatioChange = (mode: AspectRatioMode) => {
    if (onChangeAspectRatio) onChangeAspectRatio(mode);
    if (onAspectRatioChange) onAspectRatioChange(mode);
  };
  const resolvedOnCuesChange = (newCues: Cue[]) => {
    if (onUpdateCues) onUpdateCues(newCues);
    if (onCuesChange) onCuesChange(newCues);
  };
  const resolvedOnSubtitleConfigChange = <K extends keyof SubtitleConfig>(
    k: K,
    v: SubtitleConfig[K],
  ) => {
    if (onChangeSubtitleConfig) onChangeSubtitleConfig(k, v);
    if (onSubtitleConfigChange) {
      if (typeof onSubtitleConfigChange === 'function') {
        (onSubtitleConfigChange as any)((prev: SubtitleConfig) => ({ ...prev, [k]: v }));
      }
    }
  };
  const resolvedOnChaptersChange = (ch: VideoChapter[]) => {
    if (onSetChapters) onSetChapters(ch);
    if (onChaptersChange) onChaptersChange(ch);
  };
  const resolvedOnSummaryChange = (summ: VideoSummary) => {
    if (onSetSummary) onSetSummary(summ);
    if (onSummaryChange) onSummaryChange(summ);
  };
  const resolvedApiConfig: TranscriptionConfig = apiConfig ||
    aiContext || { provider: 'groq', apiKey: '' };
  const resolvedOnSaveAll = onSaveAll || onSaveAllProfiles;
  const resolvedOnSaveAudio = onSaveAudio || onSaveAudioConfig;
  const resolvedOnSaveVideo = onSaveVideo || onSaveVideoConfig;
  const resolvedOnSaveSubtitles = onSaveSubtitles || onSaveSubtitleConfig;

  const tabsConfig = [
    { id: 'audio' as InspectorTab, label: t.inspector.tabs.audio, icon: AudioLines },
    { id: 'video' as InspectorTab, label: t.inspector.tabs.video, icon: SunMedium },
    { id: 'subtitles' as InspectorTab, label: t.inspector.tabs.subtitles, icon: Captions },
    { id: 'transcript' as InspectorTab, label: t.inspector.tabs.transcript, icon: FileText },
    { id: 'ai' as InspectorTab, label: t.inspector.tabs.ai, icon: Sparkles },
    { id: 'bookmarks' as InspectorTab, label: t.inspector.tabs.bookmarks, icon: BookmarkCheck },
  ];

  return (
    <>
      {/* Mobile Backdrop overlay */}
      {isVisible && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Main Inspector Drawer */}
      <aside
        id="studio-inspector"
        aria-label="Painel de controle do estúdio"
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-sm sm:max-w-md md:static md:z-0 md:w-80 lg:w-96 flex-col border-l border-zinc-900 bg-zinc-950 transition-transform duration-300 md:translate-x-0 ${
          isVisible ? 'translate-x-0' : 'translate-x-full hidden md:hidden'
        }`}
      >
        {/* Drawer Header with Title & Tabs */}
        <div className="flex flex-col border-b border-zinc-900 bg-zinc-950/80 px-3 pt-3 shrink-0">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              {t.inspector.title}
            </span>
            <div className="flex items-center gap-1">
              {resolvedOnSaveAll && (
                <button
                  type="button"
                  onClick={resolvedOnSaveAll}
                  aria-label={t.common.saveAll}
                  className="flex items-center gap-1 rounded px-2 py-1 text-[11px] font-medium text-zinc-300 hover:bg-zinc-900 hover:text-white transition"
                  title={t.common.saveAll}
                >
                  <Save size={12} />
                  <span>{t.common.save}</span>
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                aria-label={t.common.close}
                className="rounded p-1 text-zinc-500 hover:bg-zinc-900 hover:text-white transition"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* ARIA Tabs Navigation */}
          <nav
            role="tablist"
            aria-label="Abas do painel"
            className="flex items-center gap-0.5 overflow-x-auto no-scrollbar pb-1 text-xs"
          >
            {tabsConfig.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  role="tab"
                  id={`tab-${tab.id}`}
                  aria-selected={isActive}
                  aria-controls={`panel-${tab.id}`}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center gap-1 rounded-md px-2 py-1.5 transition shrink-0 text-[11px] font-medium ${
                    isActive
                      ? 'bg-zinc-100 text-zinc-950 font-semibold'
                      : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                  }`}
                >
                  <Icon size={12} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 scrollbar-thin">
          {activeTab === 'audio' && (
            <AudioTab
              audioSettings={resolvedAudioSettings}
              activeAudioPreset={resolvedActiveAudioPreset}
              onChangeAudio={resolvedOnChangeAudio}
              onPresetAudio={resolvedOnPresetAudio}
              audioError={resolvedAudioError}
              analyser={resolvedAnalyser}
              onSaveAudio={resolvedOnSaveAudio}
            />
          )}

          {activeTab === 'video' && (
            <VideoTab
              videoFilters={videoFilters}
              onChangeVideoFilter={resolvedOnFilterChange}
              onResetVideoFilters={onResetVideoFilters || (() => {})}
              onApplyVideoPreset={onApplyVideoPreset}
              aspectRatio={aspectRatio}
              onChangeAspectRatio={resolvedOnAspectRatioChange}
              onSaveVideo={resolvedOnSaveVideo}
            />
          )}

          {activeTab === 'subtitles' && (
            <SubtitlesTab
              subtitleConfig={subtitleConfig}
              onChangeSubtitleConfig={resolvedOnSubtitleConfigChange}
              onResetSubtitleConfig={onResetSubtitleConfig || (() => {})}
              cues={cues}
              currentTime={currentTime || 0}
              onSeek={onSeek || (() => {})}
              onUpdateCues={resolvedOnCuesChange}
              onSaveSubtitles={resolvedOnSaveSubtitles}
            />
          )}

          {activeTab === 'transcript' && (
            <TranscriptTab cues={cues} currentTime={currentTime} onSeek={onSeek} />
          )}

          {activeTab === 'ai' && (
            <AiTab
              cues={cues}
              onSeek={onSeek}
              chapters={chapters}
              onSetChapters={resolvedOnChaptersChange}
              summary={summary}
              onSetSummary={resolvedOnSummaryChange}
              apiConfig={resolvedApiConfig}
              onOpenApiKeyModal={onOpenApiKeyModal}
              onUpdateCues={resolvedOnCuesChange}
            />
          )}

          {activeTab === 'bookmarks' && (
            <BookmarksTab
              bookmarks={bookmarks}
              currentTime={currentTime}
              onSeek={onSeek}
              onAddBookmark={onAddBookmark}
              onUpdateBookmarkNote={onUpdateBookmarkNote}
              onDeleteBookmark={onDeleteBookmark}
            />
          )}
        </div>
      </aside>
    </>
  );
}
