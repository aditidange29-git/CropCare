// Language context — provides t() translation function to all screens.
// Language is stored in localStorage key 'cropcare_language'.
// Defaults to 'en'. Changing language re-renders the whole app instantly.
import React, { createContext, useContext, useState, useCallback } from 'react';
import { en } from '../locales/en.ts';
import { hi } from '../locales/hi.ts';
import { mr } from '../locales/mr.ts';

type LangCode = 'en' | 'hi' | 'mr';
type Translations = typeof en;

const TRANSLATIONS: Record<LangCode, Translations> = { en, hi, mr };

function getStoredLang(): LangCode {
  const stored = localStorage.getItem('cropcare_language');
  if (stored === 'hi' || stored === 'mr') return stored;
  return 'en';
}

interface LanguageContextValue {
  lang: LangCode;
  t: (key: keyof Translations) => string;
  setLang: (code: LangCode) => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [lang, setLangState] = useState<LangCode>(getStoredLang);

  const setLang = useCallback((code: LangCode) => {
    localStorage.setItem('cropcare_language', code);
    setLangState(code);
  }, []);

  const t = useCallback((key: keyof Translations): string => {
    return TRANSLATIONS[lang][key] ?? TRANSLATIONS['en'][key] ?? String(key);
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, t, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLang must be used inside LanguageProvider');
  return ctx;
}

// Convenience export — most components just need t()
export function useT(): (key: keyof typeof en) => string {
  return useLang().t;
}
