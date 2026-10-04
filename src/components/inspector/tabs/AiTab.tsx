import React, { useState } from 'react';
import { Bot, KeyRound, Languages, ListFilter, Play, Sparkles } from 'lucide-react';
import { VideoChapter, VideoChatMessage, VideoSummary } from '../../../types/playerSettings';
import { Cue, formatClock } from '../../../utils/subtitles';
import { TranscriptionConfig } from '../../../services/transcriptionService';
import {
  answerVideoQuestion,
  generateChapters,
  generateSummary,
  translateSubtitles,
} from '../../../services/aiIntelligenceService';
import { useTranslation } from '../../../i18n/I18nContext';

interface AiTabProps {
  cues: Cue[];
  onSeek: (t: number) => void;
  chapters: VideoChapter[];
  onSetChapters: (chapters: VideoChapter[]) => void;
  summary: VideoSummary | null;
  onSetSummary: (summary: VideoSummary) => void;
  apiConfig: TranscriptionConfig;
  onOpenApiKeyModal?: () => void;
  onUpdateCues: (cues: Cue[]) => void;
}

export default function AiTab({
  cues,
  onSeek,
  chapters,
  onSetChapters,
  summary,
  onSetSummary,
  apiConfig,
  onOpenApiKeyModal,
  onUpdateCues,
}: AiTabProps) {
  const { t } = useTranslation();
  const [chatMessages, setChatMessages] = useState<VideoChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'Ola! Posso responder duvidas e encontrar momentos especificos deste video com base na transcricao.',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [targetLang, setTargetLang] = useState('en');

  const hasApiKey = Boolean(apiConfig.apiKey);

  const handleGenerateChapters = async () => {
    if (!cues.length) return;
    setIsAiLoading(true);
    setAiError(null);
    try {
      const generated = await generateChapters(cues, apiConfig);
      onSetChapters(generated);
    } catch (err) {
      setAiError((err as Error).message);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleGenerateSummary = async () => {
    if (!cues.length) return;
    setIsAiLoading(true);
    setAiError(null);
    try {
      const gen = await generateSummary(cues, apiConfig);
      onSetSummary(gen);
    } catch (err) {
      setAiError((err as Error).message);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isAiLoading) return;
    const userMsg: VideoChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: chatInput.trim(),
    };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput('');
    setIsAiLoading(true);
    setAiError(null);

    try {
      const answer = await answerVideoQuestion(cues, userMsg.text, apiConfig);
      setChatMessages((prev) => [
        ...prev,
        {
          id: `resp-${Date.now()}`,
          sender: 'assistant',
          text: answer.answer,
          matchedTime: answer.matchedTime,
        },
      ]);
    } catch (err) {
      setAiError((err as Error).message);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleTranslate = async () => {
    if (!cues.length || isAiLoading) return;
    setIsAiLoading(true);
    setAiError(null);
    try {
      const translated = await translateSubtitles(cues, targetLang, apiConfig);
      onUpdateCues(translated);
    } catch (err) {
      setAiError((err as Error).message);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div
      className="space-y-4 animate-fade-up"
      role="tabpanel"
      id="panel-ai"
      aria-labelledby="tab-ai"
    >
      {aiError && (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 p-2.5 text-xs text-red-300">
          {aiError}
        </div>
      )}

      {!hasApiKey && (
        <div className="flex items-center justify-between rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
          <span>{t.inspector.ai.apiKeyRequired}</span>
          {onOpenApiKeyModal && (
            <button
              onClick={onOpenApiKeyModal}
              className="flex items-center gap-1 rounded bg-amber-400/20 px-2 py-1 font-medium text-amber-100 hover:bg-amber-400/30 transition"
            >
              <KeyRound size={12} />
              <span>Configurar</span>
            </button>
          )}
        </div>
      )}

      {/* Chapters Section */}
      <div className="rounded-md border border-zinc-900 bg-zinc-950/60 p-3 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-200">
            <ListFilter size={13} className="text-zinc-400" />
            <span>{t.inspector.ai.chaptersTitle}</span>
          </div>
          <button
            disabled={!hasApiKey || !cues.length || isAiLoading}
            onClick={handleGenerateChapters}
            className="flex items-center gap-1 rounded bg-zinc-100 px-2 py-0.5 text-[11px] font-semibold text-zinc-950 hover:bg-white transition disabled:opacity-40"
          >
            <Sparkles size={11} />
            <span>{t.inspector.ai.generateChapters}</span>
          </button>
        </div>

        {chapters.length === 0 ? (
          <p className="text-xs text-zinc-500">{t.inspector.ai.noChapters}</p>
        ) : (
          <div className="max-h-48 overflow-y-auto space-y-1.5 scrollbar-thin">
            {chapters.map((ch, idx) => (
              <button
                key={idx}
                onClick={() => onSeek(ch.start)}
                className="flex w-full items-center justify-between rounded bg-zinc-900/60 p-2 text-left text-xs hover:bg-zinc-900 transition"
              >
                <div className="flex items-center gap-2">
                  <Play size={11} className="text-zinc-400" />
                  <span className="font-medium text-zinc-200">{ch.title}</span>
                </div>
                <span className="font-mono text-[10px] text-zinc-400">{formatClock(ch.start)}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Executive Summary Section */}
      <div className="rounded-md border border-zinc-900 bg-zinc-950/60 p-3 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-200">
            <Bot size={13} className="text-zinc-400" />
            <span>{t.inspector.ai.summaryTitle}</span>
          </div>
          <button
            disabled={!hasApiKey || !cues.length || isAiLoading}
            onClick={handleGenerateSummary}
            className="flex items-center gap-1 rounded bg-zinc-100 px-2 py-0.5 text-[11px] font-semibold text-zinc-950 hover:bg-white transition disabled:opacity-40"
          >
            <Sparkles size={11} />
            <span>{t.inspector.ai.generateSummary}</span>
          </button>
        </div>

        {summary ? (
          <div className="space-y-2 text-xs text-zinc-300">
            <p className="leading-relaxed">{summary.overview}</p>
            {summary.keyPoints && summary.keyPoints.length > 0 && (
              <ul className="list-disc pl-4 space-y-1 text-zinc-400 text-[11px]">
                {summary.keyPoints.map((pt, i) => (
                  <li key={i}>{pt}</li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <p className="text-xs text-zinc-500">{t.inspector.ai.summaryPlaceholder}</p>
        )}
      </div>

      {/* Subtitles Translation */}
      <div className="rounded-md border border-zinc-900 bg-zinc-950/60 p-3 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-200">
            <Languages size={13} className="text-zinc-400" />
            <span>{t.inspector.ai.translateTitle}</span>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              className="rounded bg-zinc-900 border border-zinc-800 px-2 py-0.5 text-xs text-zinc-200 outline-none"
            >
              <option value="en">Ingles (EN)</option>
              <option value="es">Espanhol (ES)</option>
              <option value="pt">Portugues (PT)</option>
              <option value="fr">Frances (FR)</option>
              <option value="de">Alemao (DE)</option>
            </select>
            <button
              disabled={!hasApiKey || !cues.length || isAiLoading}
              onClick={handleTranslate}
              className="rounded bg-zinc-100 px-2 py-0.5 text-[11px] font-semibold text-zinc-950 hover:bg-white transition disabled:opacity-40"
            >
              {t.inspector.ai.translateButton}
            </button>
          </div>
        </div>
      </div>

      {/* AI Q&A Chat Section */}
      <div className="rounded-md border border-zinc-900 bg-zinc-950/60 p-3 space-y-2.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-200">
          <Bot size={13} className="text-zinc-400" />
          <span>{t.inspector.ai.chatTitle}</span>
        </div>

        <div className="max-h-48 overflow-y-auto space-y-2 scrollbar-thin p-1">
          {chatMessages.map((m) => (
            <div
              key={m.id}
              className={`rounded-md p-2 text-xs leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-zinc-800 text-zinc-100 ml-6 text-right'
                  : 'bg-zinc-900 text-zinc-300 mr-6'
              }`}
            >
              <p>{m.text}</p>
              {m.matchedTime !== undefined && (
                <button
                  onClick={() => onSeek(m.matchedTime!)}
                  className="mt-1 inline-flex items-center gap-1 font-mono text-[10px] text-zinc-400 hover:text-white"
                >
                  <Play size={10} />
                  <span>Pular para {formatClock(m.matchedTime)}</span>
                </button>
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            disabled={!hasApiKey || !cues.length || isAiLoading}
            placeholder={t.inspector.ai.chatPlaceholder}
            className="flex-1 rounded bg-zinc-900/80 border border-zinc-850 px-2.5 py-1.5 text-xs text-zinc-200 outline-none focus:border-zinc-700 disabled:opacity-40"
          />
          <button
            type="submit"
            disabled={!hasApiKey || !cues.length || isAiLoading || !chatInput.trim()}
            className="rounded bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-950 hover:bg-white transition disabled:opacity-40"
          >
            {t.inspector.ai.sendQuestion}
          </button>
        </form>
      </div>
    </div>
  );
}
