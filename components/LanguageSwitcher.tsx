"use client";

import { memo, useSyncExternalStore } from "react";
import { useLanguage, Language } from "../lib/LanguageContext";

// SVG Flag components for cross-platform compatibility
const ItalyFlag = () => (
  <svg width="20" height="14" viewBox="0 0 3 2" className="lang-flag-svg">
    <rect width="1" height="2" fill="#009246" />
    <rect width="1" height="2" x="1" fill="#fff" />
    <rect width="1" height="2" x="2" fill="#ce2b37" />
  </svg>
);

const UKFlag = () => (
  <svg width="20" height="14" viewBox="0 0 60 30" className="lang-flag-svg">
    <clipPath id="uk-clip">
      <rect width="60" height="30" />
    </clipPath>
    <g clipPath="url(#uk-clip)">
      <rect width="60" height="30" fill="#012169" />
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" strokeWidth="4" clipPath="url(#uk-center)" />
      <clipPath id="uk-center">
        <path d="M30,0 L30,15 L0,15 L0,0 Z M30,30 L30,15 L60,15 L60,30 Z M0,15 L30,15 L30,30 Z M60,15 L30,15 L30,0 Z" />
      </clipPath>
      <path d="M30,0 V30 M0,15 H60" stroke="#fff" strokeWidth="10" />
      <path d="M30,0 V30 M0,15 H60" stroke="#C8102E" strokeWidth="6" />
    </g>
  </svg>
);

// Store for hydration-safe mounting detection
const mountedStore = {
  mounted: false,
  listeners: new Set<() => void>(),
  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  },
  getSnapshot() {
    return this.mounted;
  },
  getServerSnapshot() {
    return false;
  },
  setMounted() {
    this.mounted = true;
    this.listeners.forEach(l => l());
  }
};

// Initialize on client
if (typeof window !== "undefined") {
  mountedStore.setMounted();
}

function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const mounted = useSyncExternalStore(
    mountedStore.subscribe.bind(mountedStore),
    mountedStore.getSnapshot.bind(mountedStore),
    mountedStore.getServerSnapshot
  );

  const handleChange = (lang: Language) => {
    setLanguage(lang);
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="lang-switcher flex items-center gap-1">
        <button className="lang-btn is-active" aria-label="Italiano">
          <ItalyFlag />
        </button>
        <button className="lang-btn" aria-label="English">
          <UKFlag />
        </button>
      </div>
    );
  }

  return (
    <div className="lang-switcher flex items-center gap-1">
      <button
        onClick={() => handleChange("it")}
        className={`lang-btn ${language === "it" ? "is-active" : ""}`}
        aria-label="Italiano"
        title="Italiano"
      >
        <ItalyFlag />
      </button>
      <button
        onClick={() => handleChange("en")}
        className={`lang-btn ${language === "en" ? "is-active" : ""}`}
        aria-label="English"
        title="English"
      >
        <UKFlag />
      </button>
    </div>
  );
}

export default memo(LanguageSwitcher);
