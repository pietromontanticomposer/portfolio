"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";

export type Language = "it" | "en";

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (it: string, en: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Always start with "en" for SSR consistency
  const [language, setLanguageState] = useState<Language>("en");
  const [mounted, setMounted] = useState(false);

  // After mount, read from localStorage using layout effect to avoid flicker
  useEffect(() => {
    const saved = localStorage.getItem("lang");
    // Use microtask to batch state updates and avoid cascading renders
    queueMicrotask(() => {
      if (saved === "it" || saved === "en") {
        setLanguageState(saved);
      }
      setMounted(true);
    });
  }, []);

  // Keep document language in sync after hydration
  useEffect(() => {
    if (!mounted) return;
    document.documentElement.lang = language;
  }, [mounted, language]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("lang", lang);
  }, []);

  // Helper function to get translated text
  // Always return English until mounted to prevent hydration mismatch
  const t = useCallback((it: string, en: string): string => {
    if (!mounted) return en;
    return language === "it" ? it : en;
  }, [mounted, language]);

  // For direct language access, also respect mounted state
  const effectiveLanguage = mounted ? language : "en";

  return (
    <LanguageContext.Provider value={{ language: effectiveLanguage, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
