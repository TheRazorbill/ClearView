import { useEffect, useState } from 'react';
import { ExternalLink, KeyRound, X } from 'lucide-react';
import { PROVIDERS, Provider } from '../services/transcriptionService';

export interface ApiSettings {
  provider: Provider;
  keys: Record<Provider, string>;
  language: string;
}

const STORAGE_KEY = 'clearview.api';

export function loadApiSettings(): ApiSettings {
  const defaults: ApiSettings = {
    provider: 'groq',
    keys: { groq: '', openai: '', gemini: '' },
    language: '',
  };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      return { ...defaults, ...saved, keys: { ...defaults.keys, ...saved.keys } };
    }
  } catch {
    /* ignore */
  }
  return defaults;
}

interface Props {
  open: boolean;
  initial: ApiSettings;
  onClose: () => void;
  onSave: (s: ApiSettings, startNow: boolean) => void;
}

export default function ApiKeyModal({ open, initial, onClose, onSave }: Props) {
  const [s, setS] = useState(initial);
  useEffect(() => {
    if (open) setS(initial);
  }, [open, initial]);
  if (!open) return null;

  const p = PROVIDERS[s.provider];
  const save = (start: boolean) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    onSave(s, start);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-lg border border-zinc-800 bg-zinc-900 p-4 sm:p-6 shadow-2xl animate-fade-up"
      >
        <div className="mb-4 sm:mb-5 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-base sm:text-lg font-semibold">
            <KeyRound size={18} className="text-accent" /> Legendas com IA
          </h2>
          <button
            id="modal-close"
            onClick={onClose}
            className="rounded-md p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-zinc-500">
          Provedor
        </label>
        <div className="mb-4 sm:mb-5 grid grid-cols-1 sm:grid-cols-3 gap-2">
          {(Object.keys(PROVIDERS) as Provider[]).map((id) => (
            <button
              key={id}
              id={`provider-${id}`}
              onClick={() => setS({ ...s, provider: id })}
              className={`rounded-md border px-3 py-2 sm:py-2.5 text-left text-sm transition ${
                s.provider === id
                  ? 'border-accent bg-accent-soft'
                  : 'border-zinc-800 hover:border-zinc-600'
              }`}
            >
              <div className="font-medium capitalize">{id}</div>
              <div className="text-[11px] sm:text-xs text-zinc-400">
                {id === 'groq'
                  ? 'Gratis · ultrarrapido'
                  : id === 'gemini'
                    ? 'Gratis · AI Studio'
                    : 'Pago por minuto'}
              </div>
            </button>
          ))}
        </div>

        <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-zinc-500">
          Chave de API
        </label>
        <input
          id="api-key-input"
          type="password"
          value={s.keys[s.provider]}
          onChange={(e) => setS({ ...s, keys: { ...s.keys, [s.provider]: e.target.value.trim() } })}
          placeholder={s.provider === 'groq' ? 'gsk_…' : s.provider === 'gemini' ? 'AIza…' : 'sk-…'}
          className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-4 py-2.5 font-mono text-sm outline-none focus:border-accent"
        />
        <a
          href={p.keyUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-flex items-center gap-1 text-xs text-accent hover:underline"
        >
          Obter chave {p.free && 'gratuita'} <ExternalLink size={12} />
        </a>
        {s.provider === 'gemini' && (
          <p className="mt-2 text-xs text-zinc-500">
            A assinatura Gemini Pro (app) é separada da API: gere a chave no Google AI Studio.
            Timestamps do Gemini são menos precisos que os do Whisper.
          </p>
        )}

        <label className="mb-2 mt-5 block text-xs font-medium uppercase tracking-wider text-zinc-500">
          Idioma (opcional)
        </label>
        <select
          id="language-select"
          value={s.language}
          onChange={(e) => setS({ ...s, language: e.target.value })}
          className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm outline-none focus:border-accent"
        >
          <option value="">Detectar automaticamente</option>
          <option value="pt">Português</option>
          <option value="en">Inglês</option>
          <option value="es">Espanhol</option>
          <option value="fr">Francês</option>
          <option value="de">Alemão</option>
          <option value="it">Italiano</option>
          <option value="ja">Japonês</option>
        </select>

        <p className="mt-4 text-xs text-zinc-500">
          A chave fica salva apenas no seu navegador (localStorage) e é enviada diretamente ao
          provedor.
        </p>

        <div className="mt-6 flex justify-end gap-2">
          <button
            id="modal-save"
            onClick={() => save(false)}
            className="rounded-md px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
          >
            Salvar
          </button>
          <button
            id="modal-generate"
            disabled={!s.keys[s.provider]}
            onClick={() => save(true)}
            className="rounded-md bg-accent px-5 py-2 text-sm font-semibold text-zinc-950 transition hover:brightness-110 disabled:opacity-40"
          >
            Gerar legendas
          </button>
        </div>
      </div>
    </div>
  );
}
