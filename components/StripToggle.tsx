"use client";

import { useState, memo } from "react";
import AutoScrollStrip from "./AutoScrollStrip";
import PosterCard from "./PosterCard";
import { useLanguage } from "../lib/LanguageContext";

type Poster = {
  slug: string;
  title: string;
  year?: string;
  tag?: string;
  image?: string;
};

function StripToggle({ posters }: { posters: Poster[] }) {
  const [view, setView] = useState<"strip" | "grid">("strip");
  const { t } = useLanguage();

  const isStrip = view === "strip";

  return (
    <div className="strip-toggle" style={{ marginTop: 8 }} data-view={view}>
      <div className="strip-toggle-controls">
        <button
          type="button"
          className={`strip-toggle-button strip-toggle-icon ${isStrip ? "is-active" : ""}`}
          onClick={() => setView("strip")}
          aria-label={t("Vista scorrimento", "Scroll view")}
          title={t("Vista scorrimento", "Scroll view")}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <rect x="3" y="6" width="18" height="3.2" rx="1.6" fill="currentColor" />
            <rect x="3" y="10.8" width="18" height="3.2" rx="1.6" fill="currentColor" />
            <rect x="3" y="15.6" width="18" height="3.2" rx="1.6" fill="currentColor" />
          </svg>
        </button>
        <button
          type="button"
          className={`strip-toggle-button strip-toggle-icon ${!isStrip ? "is-active" : ""}`}
          onClick={() => setView("grid")}
          aria-label={t("Vista griglia", "Grid view")}
          title={t("Vista griglia", "Grid view")}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <rect x="3" y="4" width="7" height="7" rx="1.2" stroke="currentColor" strokeWidth="1.4" fill="none" />
            <rect x="14" y="4" width="7" height="7" rx="1.2" stroke="currentColor" strokeWidth="1.4" fill="none" />
            <rect x="3" y="13" width="7" height="7" rx="1.2" stroke="currentColor" strokeWidth="1.4" fill="none" />
            <rect x="14" y="13" width="7" height="7" rx="1.2" stroke="currentColor" strokeWidth="1.4" fill="none" />
          </svg>
        </button>
      </div>

      {isStrip ? (
        <div className="strip-toggle-strip">
          <AutoScrollStrip posters={posters} />
        </div>
      ) : (
        <div className="strip-toggle-grid">
          <div className="poster-grid-gridview">
            {posters.map((p) => (
              <div key={p.slug}>
                <PosterCard
                  title={p.title}
                  year={p.year}
                  tag={p.tag}
                  image={p.image}
                  href={`/portfolio/${p.slug}`}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Memoize to prevent unnecessary re-renders when parent updates
export default memo(StripToggle);
