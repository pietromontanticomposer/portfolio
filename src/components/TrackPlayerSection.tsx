"use client";
import dynamic from 'next/dynamic';
import { useEffect, useState, useRef } from 'react';

const TrackPlayer = dynamic(() => import('./TrackPlayerClient'), {
  ssr: false,
  loading: () => <div className="track-player-skeleton">Loading player...</div>
});

type Track = {
  file: string;
  context: string;
  cover?: string;
};

type Props = {
  tracks: Track[];
};

export default function TrackPlayerSection({ tracks }: Props) {
  const [shouldLoad, setShouldLoad] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Lazy load TrackPlayer only when section is near viewport
    if (!sectionRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldLoad(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '200px', // Load 200px before entering viewport
      }
    );

    observer.observe(sectionRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <section id="selected-tracks" className="card-shell p-8" ref={sectionRef}>
      <div className="flex items-center justify-between">
        <h3 className="section-title text-2xl text-[color:var(--foreground)]">
          Selected Tracks
        </h3>
      </div>
      <div className="mt-6">
        {shouldLoad ? (
          <TrackPlayer
            tracks={tracks}
            coverSrc={tracks[0]?.cover ?? 'https://4glkq64bdlmmple5.public.blob.vercel-storage.com/optimized/uploads/foto-sito.webp'}
          />
        ) : (
          <div className="track-player-skeleton" style={{ minHeight: '400px' }}>
            Scroll to load player...
          </div>
        )}
      </div>
    </section>
  );
}
