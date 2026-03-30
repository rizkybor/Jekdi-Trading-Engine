"use client";

import React, { createContext, useCallback, useContext, useSyncExternalStore } from 'react';
import { Language, translations, TranslationKey } from '@/lib/translations';

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const DEFAULT_LANGUAGE: Language = "id";

function readStoredLanguage(): Language {
  if (typeof window === "undefined") return DEFAULT_LANGUAGE;
  const savedLang = localStorage.getItem("app-language");
  return savedLang === "en" || savedLang === "id" ? savedLang : DEFAULT_LANGUAGE;
}

function subscribeLanguage(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const handler = () => callback();
  window.addEventListener("storage", handler);
  window.addEventListener("app-language", handler);
  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener("app-language", handler);
  };
}

const getServerSnapshot = () => DEFAULT_LANGUAGE;

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const language = useSyncExternalStore(subscribeLanguage, readStoredLanguage, getServerSnapshot);

  const handleSetLanguage = useCallback((lang: Language) => {
    if (typeof window === "undefined") return;
    localStorage.setItem('app-language', lang);
    window.dispatchEvent(new Event("app-language"));
  }, []);

  const t = (key: TranslationKey): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    console.warn('useLanguage must be used within a LanguageProvider. Falling back to default en/id translations to prevent crashes.');
    // Provide a safe fallback instead of throwing an error
    return {
      language: 'id' as Language,
      setLanguage: () => {},
      t: (key: TranslationKey) => translations['id'][key] || key
    };
  }
  return context;
}
