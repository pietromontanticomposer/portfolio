"use client";

import React, { useState } from "react";
import AutoScrollStrip from "./AutoScrollStrip";
import PosterCard from "./PosterCard";

type Poster = {
  slug: string;
  title: string;
  year?: string;
  tag?: string;
  image?: string;
};

export function ToggleButton({ view, onToggle }: { view: "strip" | "grid"; onToggle: () => void }) {
  return (
    <div className="strip-toggle-controls">
      <button
        aria-pressed={view === "grid"}
        onClick={onToggle}
        className={`strip-toggle-button strip-toggle-icon ${view === "grid" ? "is-active" : ""}`}
        title={view === "strip" ? "Apri griglia" : "Torna a scorrimento"}
      >
        {view === "strip" ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="4" y="4" width="7" height="7" rx="2" fill="currentColor"/><rect x="13" y="4" width="7" height="7" rx="2" fill="currentColor"/><rect x="4" y="13" width="7" height="7" rx="2" fill="currentColor"/><rect x="13" y="13" width="7" height="7" rx="2" fill="currentColor"/></svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="4" y="10" width="16" height="4" rx="2" fill="currentColor"/></svg>
        )}
      </button>
    </div>
  );
}

function StripToggle({ posters }: { posters: Poster[] }) {
  const [view, setView] = useState<"strip" | "grid">("strip");

  const isStrip = view === "strip";
  const toggleLabel = isStrip ? "Grid view" : "Scroll view";

  return (
    <div className="strip-toggle" style={{ marginTop: 8 }}>
      <div className="strip-toggle-controls">
        <button
          type="button"
          className="strip-toggle-button strip-toggle-icon is-active"
          onClick={() => setView(isStrip ? "grid" : "strip")}
          aria-label={toggleLabel}
          title={toggleLabel}
        >
          {isStrip ? (
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <rect x="3" y="4" width="7" height="7" rx="1.2" stroke="currentColor" strokeWidth="1.4" fill="none" />
              <rect x="14" y="4" width="7" height="7" rx="1.2" stroke="currentColor" strokeWidth="1.4" fill="none" />
              <rect x="3" y="13" width="7" height="7" rx="1.2" stroke="currentColor" strokeWidth="1.4" fill="none" />
              <rect x="14" y="13" width="7" height="7" rx="1.2" stroke="currentColor" strokeWidth="1.4" fill="none" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <rect x="3" y="6" width="18" height="3.2" rx="1.6" fill="currentColor" />
              <rect x="3" y="10.8" width="18" height="3.2" rx="1.6" fill="currentColor" />
              <rect x="3" y="15.6" width="18" height="3.2" rx="1.6" fill="currentColor" />
            </svg>
          )}
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
export default React.memo(StripToggle);
