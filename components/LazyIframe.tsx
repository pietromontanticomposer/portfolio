"use client";

import { useState, useMemo, memo } from "react";

function LazyIframe({
  src,
  title,
  height = 120,
  allow,
  className,
  autoLoad,
  buttonLabel = "Carica media",
}: {
  src: string;
  title?: string;
  height?: number;
  allow?: string;
  className?: string;
  autoLoad?: boolean;
  buttonLabel?: string;
}) {
  const [loaded, setLoaded] = useState(Boolean((autoLoad as boolean) || false));

  // Memoize the iframe src calculation
  const iframeSrc = useMemo(() => {
    try {
      // If this is a SoundCloud embed widget, prefer the compact non-visual player
      if (typeof src === 'string' && src.includes('w.soundcloud.com/player')) {
        const url = new URL(src);
        const params = url.searchParams;
        // set compact view and reduce UI elements
        if (!params.has('visual')) params.set('visual', 'false');
        if (!params.has('show_artwork')) params.set('show_artwork', 'true');
        if (!params.has('show_comments')) params.set('show_comments', 'false');
        if (!params.has('show_user')) params.set('show_user', 'false');
        if (!params.has('show_reposts')) params.set('show_reposts', 'false');
        return url.toString();
      }
    } catch {
      // ignore
    }
    return src;
  }, [src]);

  return (
    <div className={className ? className : "lazy-iframe"}>
      {!loaded ? (
        <div className="lazy-iframe-placeholder" style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={() => setLoaded(true)}
            className="modal-close"
            aria-label={`Load ${title || "media"}`}
          >
            {buttonLabel}
          </button>
        </div>
      ) : (
        <iframe
          src={iframeSrc}
          title={title}
          width="100%"
          height={height}
          frameBorder="0"
          loading="lazy"
          allow={allow}
          allowFullScreen
        />
      )}
    </div>
  );
}

export default memo(LazyIframe);