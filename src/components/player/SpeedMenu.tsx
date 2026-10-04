import React from 'react';
import { Gauge } from 'lucide-react';
import { useTranslation } from '../../i18n/I18nContext';

export const SPEED_OPTIONS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3];

interface SpeedMenuProps {
  currentSpeed: number;
  isOpen: boolean;
  onToggle: () => void;
  onSelectSpeed: (speed: number) => void;
}

export const SpeedMenu: React.FC<SpeedMenuProps> = ({
  currentSpeed,
  isOpen,
  onToggle,
  onSelectSpeed,
}) => {
  const { t } = useTranslation();

  return (
    <div className="relative shrink-0">
      <button
        id="btn-speed"
        type="button"
        onClick={onToggle}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className="flex items-center gap-1 rounded px-1.5 sm:px-2 py-1 text-xs font-mono font-medium hover:bg-white/10 transition"
        title="Velocidade ([ e ])"
      >
        <Gauge size={13} className="text-zinc-400" />
        <span>{currentSpeed}x</span>
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-label={t.controls.speed}
          onClick={(e) => e.stopPropagation()}
          className="absolute bottom-full right-0 mb-2 w-32 rounded-md border border-zinc-800 bg-zinc-950 p-1 shadow-xl animate-fade-up z-50 text-xs"
        >
          <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 border-b border-zinc-800/80 mb-1">
            {t.controls.speed}
          </div>
          <div className="max-h-48 overflow-y-auto scrollbar-thin">
            {SPEED_OPTIONS.map((speed) => (
              <button
                key={speed}
                role="menuitem"
                type="button"
                onClick={() => onSelectSpeed(speed)}
                className={`flex w-full items-center justify-between rounded px-2 py-1 text-left transition ${
                  currentSpeed === speed
                    ? 'bg-zinc-100 text-zinc-950 font-semibold'
                    : 'text-zinc-300 hover:bg-zinc-800/80'
                }`}
              >
                <span>{speed}x</span>
                {speed === 1 && <span className="text-[10px] text-zinc-500">Normal</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
