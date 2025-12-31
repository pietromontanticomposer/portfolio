"use client";

import React, { useState } from "react";
import PartnerAutoScrollStrip from "./PartnerAutoScrollStrip";
import Image from "next/image";

type Partner = { name: string; image: string };

function PartnerStripToggle({ partners }: { partners: Partner[] }) {
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
          <PartnerAutoScrollStrip partners={partners} />
        </div>
      ) : (
        <div className="strip-toggle-grid">
          <div className="partner-grid-gridview">
            {partners.map((p) => (
              <div key={p.name} className="partner-card">
                <Image src={p.image} alt={p.name} width={140} height={70} className="object-contain" loading="lazy" decoding="async" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Memoize to prevent unnecessary re-renders when parent updates
export default React.memo(PartnerStripToggle);
