"use client";
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useEffect, useState, useRef } from 'react';
import ContactPopover from "./ContactPopover";
import { useLanguage } from "../lib/LanguageContext";

const TrackPlayer = dynamic(() => import('./TrackPlayerClient'), {
  ssr: false,
  loading: () => <div className="track-player-skeleton">Loading player...</div>
});

type Track = {
  file?: string;
  context: string;
  cover?: string;
};

type Props = {
  tracks: Track[];
  placeholderTracks?: Track[];
};

export default function TrackPlayerSection({
  tracks,
  placeholderTracks = [],
}: Props) {
  const { t } = useLanguage();
  const [shouldLoad, setShouldLoad] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const playableTracks = tracks.filter(
    (track) => typeof track.file === "string" && track.file.trim().length > 0
  );
  const hasPlayableTracks = playableTracks.length > 0;
  const displayTracks =
    hasPlayableTracks || placeholderTracks.length === 0
      ? playableTracks
      : placeholderTracks;
  const coverSrc =
    displayTracks[0]?.cover ??
    "https://4glkq64bdlmmple5.public.blob.vercel-storage.com/optimized/uploads/foto-sito.webp";

  useEffect(() => {
    // Lazy load TrackPlayer only when section is near viewport
    if (!sectionRef.current || !hasPlayableTracks) return;

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
        rootMargin: '600px',
      }
    );

    observer.observe(sectionRef.current);

    return () => observer.disconnect();
  }, [hasPlayableTracks]);

  return (
    <section id="selected-tracks" className="card-shell p-8" ref={sectionRef}>
      <div className="flex items-center justify-between">
        <h3 className="section-title text-2xl text-[color:var(--foreground)]">
          {t("Tracce Selezionate", "Selected Tracks")}
        </h3>
      </div>
      <div className="mt-6">
        {hasPlayableTracks ? (
          shouldLoad ? (
            <TrackPlayer tracks={playableTracks} coverSrc={coverSrc} />
          ) : (
            <div className="track-player-skeleton" style={{ minHeight: '400px' }}>
              {t("Scorri per caricare il player...", "Scroll to load player...")}
            </div>
          )
        ) : (
          <div className="track-player">
            <div className="track-player-cover-wrap">
              <div className="track-player-cover">
                {coverSrc ? (
                  <Image src={coverSrc} alt="Placeholder cover" width={400} height={400} className="object-cover" />
                ) : (
                  <div className="track-player-cover-empty" />
                )}
              </div>
            </div>
            <div className="track-player-wave">
              <div className="audio-player">
                <div className="audio-player-row">
                  <button
                    type="button"
                    className="audio-play"
                    disabled
                    aria-disabled="true"
                    aria-label="Playback disabled"
                  >
                    <span className="audio-icon is-play" aria-hidden="true" />
                  </button>
                  <div className="audio-wave">
                    <div className="audio-loading">
                      {t("Link di ascolto disponibile su richiesta", "Listening link available on request")}
                    </div>
                  </div>
                  <div className="audio-volume">
                    <button
                      type="button"
                      className="audio-volume-toggle"
                      disabled
                      aria-disabled="true"
                      aria-label="Volume disabled"
                    >
                      <svg
                        className="audio-volume-svg"
                        viewBox="0 0 24 24"
                        width="22"
                        height="22"
                        aria-hidden="true"
                      >
                        <path
                          d="M4 9v6h4l5 4V5L8 9H4z"
                          fill="currentColor"
                        />
                        <path
                          d="M14.5 8.5a3.5 3.5 0 010 7"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          fill="none"
                        />
                        <path
                          d="M17.5 6a6 6 0 010 12"
                          stroke="currentColor"
                          strokeWidth="1.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          fill="none"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="track-player-list" role="list">
              {displayTracks.map((track, index) => (
                <div
                  key={`${track.context}-${index}`}
                  className="track-row"
                  style={{ cursor: "default" }}
                >
                  <span className="track-row-title">{track.context}</span>
                  <span className="track-row-time">--:--</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {!hasPlayableTracks ? (
        <div className="mt-6">
          <ContactPopover
            buttonLabel={t("Richiedi link di ascolto", "Request listening link")}
            buttonClassName="hero-btn hero-btn-secondary"
            align="left"
            panelId="contact-popover-tracks"
          />
        </div>
      ) : null}
    </section>
  );
}
