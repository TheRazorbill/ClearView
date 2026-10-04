import React from 'react';
import { Film } from 'lucide-react';
import { useTranslation } from '../../i18n/I18nContext';

interface SampleVideoBannerProps {
  onLoadSample: () => void;
}

export const SampleVideoBanner: React.FC<SampleVideoBannerProps> = ({ onLoadSample }) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between rounded-lg border border-dashed border-zinc-800 bg-zinc-950/60 p-3 sm:p-4 text-xs sm:text-sm">
      <div className="flex items-center gap-2.5 sm:gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-zinc-900 text-zinc-300">
          <Film size={18} />
        </div>
        <div>
          <p className="font-medium text-zinc-200">{t.demo.bannerTitle}</p>
          <p className="text-zinc-500 text-xs">{t.demo.bannerSubtitle}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onLoadSample}
        className="rounded-md bg-zinc-100 px-3 py-1.5 font-medium text-xs text-zinc-950 hover:bg-white transition shrink-0"
      >
        {t.demo.loadButton}
      </button>
    </div>
  );
};
