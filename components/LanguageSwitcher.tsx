"use client";

import { memo, useSyncExternalStore } from "react";
import { useLanguage, Language } from "../lib/LanguageContext";

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
          <span className="lang-flag">🇮🇹</span>
        </button>
        <button className="lang-btn" aria-label="English">
          <span className="lang-flag">🇬🇧</span>
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
        <span className="lang-flag">🇮🇹</span>
      </button>
      <button
        onClick={() => handleChange("en")}
        className={`lang-btn ${language === "en" ? "is-active" : ""}`}
        aria-label="English"
        title="English"
      >
        <span className="lang-flag">🇬🇧</span>
      </button>
    </div>
  );
}

export default memo(LanguageSwitcher);
