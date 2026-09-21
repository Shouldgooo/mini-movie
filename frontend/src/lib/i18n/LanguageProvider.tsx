"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  interpolate,
  messages,
  type Language,
  type MessageKey,
} from "./dictionary";
import { DEFAULT_LANGUAGE, LANGUAGE_STORAGE_KEY } from "./config";

const listeners = new Set<() => void>();

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: MessageKey, vars?: Record<string, string | number>) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function isLanguage(value: string | null): value is Language {
  return value === "zh" || value === "en";
}

function readLanguage(): Language {
  const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return isLanguage(stored) ? stored : DEFAULT_LANGUAGE;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function writeLanguage(next: Language) {
  window.localStorage.setItem(LANGUAGE_STORAGE_KEY, next);
  listeners.forEach((listener) => listener());
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const language = useSyncExternalStore<Language>(
    subscribe,
    readLanguage,
    () => DEFAULT_LANGUAGE
  );

  useEffect(() => {
    document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
  }, [language]);

  const setLanguage = useCallback((next: Language) => {
    writeLanguage(next);
  }, []);

  const t = useCallback(
    (key: MessageKey, vars?: Record<string, string | number>) => {
      return interpolate(messages[language][key], vars);
    },
    [language]
  );

  const value = useMemo(
    () => ({ language, setLanguage, t }),
    [language, setLanguage, t]
  );

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }

  return context;
}
