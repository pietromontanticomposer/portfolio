/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useRef, useState } from 'react';

export default function TrackPlayerClient(props: any) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [shouldRender, setShouldRender] = useState(false);
  const [LoadedComp, setLoadedComp] = useState<any>(null);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldRender(true);
          observer.disconnect();
        }
      },
      { rootMargin: "150px 0px" } // Reduced from 300px for less aggressive preloading
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let mounted = true;
    if (shouldRender && !LoadedComp) {
      import('./TrackPlayer')
        .then((mod) => {
          if (!mounted) return;
          setLoadedComp(() => (mod && (mod as any).default) || mod);
        })
        .catch((err) => {
          console.error('[TrackPlayerClient] failed to load TrackPlayer', err);
        });
    }
    return () => {
      mounted = false;
    };
  }, [shouldRender, LoadedComp]);

  return (
    <div ref={containerRef}>
      {shouldRender ? (
        LoadedComp ? (
          <LoadedComp {...props} />
        ) : (
          <div className="track-player-skeleton" style={{ minHeight: '400px' }} />
        )
      ) : (
        <div className="track-player-skeleton" style={{ minHeight: '400px' }} />
      )}
    </div>
  );
}
