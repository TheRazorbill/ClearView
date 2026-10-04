import React, { createContext, useContext, useEffect, useState } from 'react';
import { Locale, Translations } from './types';
import { pt } from './locales/pt';
import { en } from './locales/en';

interface I18nContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: Translations;
}

const STORAGE_KEY = 'clearview.locale';

const translationsMap: Record<Locale, Translations> = { pt, en };

function getInitialLocale(): Locale {
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (saved && (saved === 'pt' || saved === 'en')) {
      return saved;
    }
    const navLang = navigator.language?.toLowerCase() || '';
    if (navLang.startsWith('en')) {
      return 'en';
    }
  } catch {
    /* empty */
  }
  return 'pt';
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem(STORAGE_KEY, newLocale);
      document.documentElement.lang = newLocale === 'pt' ? 'pt-BR' : 'en-US';
    } catch {
      /* empty */
    }
  };

  useEffect(() => {
    document.documentElement.lang = locale === 'pt' ? 'pt-BR' : 'en-US';
  }, [locale]);

  const value: I18nContextValue = {
    locale,
    setLocale,
    t: translationsMap[locale] || pt,
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) {
    return {
      locale: 'pt' as Locale,
      setLocale: () => {},
      t: pt,
    };
  }
  return context;
}
