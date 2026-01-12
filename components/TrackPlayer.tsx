"use client";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import AudioPlayer, { preloadWaveformJsonBatch, loadDurationFromWaveform } from "./AudioPlayer";
import { formatTime, getTitle } from "../lib/formatUtils";

type Track = {
  file: string;
  context: string;
  cover?: string;
};

type Props = {
  tracks: Track[];
  coverSrc: string;
  displayDurations?: Array<number | null>;
  waveColor?: string;
  progressColor?: string;
  showRowCover?: boolean;
  rowCoverSrc?: string;
};

const CoverArt = memo(function CoverArt({ src }: { src: string }) {
  return (
    <div className="track-player-cover">
      {src ? (
        <Image
          src={src}
          alt="Cover art"
          fill
          sizes="140px"
          priority
        />
      ) : (
        <div className="track-player-cover-empty" />
      )}
    </div>
  );
});

function TrackPlayer({
  tracks,
  coverSrc,
  displayDurations,
  waveColor = "#5b4bff",
  progressColor = "#4338ca",
  showRowCover = false,
  rowCoverSrc,
}: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [durations, setDurations] = useState<Record<number, number>>({});
  const [nowPlaying, setNowPlaying] = useState<{ isPlaying: boolean; currentTime: number; duration: number }>({ isPlaying: false, currentTime: 0, duration: 0 });
  const [hasPlayed, setHasPlayed] = useState(false);
  const [coverLoaded, setCoverLoaded] = useState<Record<string, boolean>>({});

  // Preload waveform JSONs for all tracks immediately (very fast, just JSON)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const audioSources = tracks.map((t) => t.file);
    preloadWaveformJsonBatch(audioSources);
  }, [tracks]);

  // Preload covers only
  useEffect(() => {
    if (typeof window === "undefined") return;
    const seenCovers = new Set<string>();

    tracks.forEach((track) => {
      const coverUrl = track.cover ?? coverSrc;
      if (coverUrl && !seenCovers.has(coverUrl)) {
        seenCovers.add(coverUrl);
        const img = new window.Image();
        img.onload = () => setCoverLoaded((prev) => ({ ...prev, [coverUrl]: true }));
        img.onerror = () => setCoverLoaded((prev) => ({ ...prev, [coverUrl]: true }));
        img.src = coverUrl;
      }
    });
  }, [tracks, coverSrc]);

  // Load durations from waveform JSON files (much faster than loading audio metadata)
  useEffect(() => {
    let isMounted = true;

    // Load durations for all tracks from waveform JSON (lightweight)
    tracks.forEach((track, index) => {
      if (durations[index] !== undefined) return;
      loadDurationFromWaveform(track.file).then((dur) => {
        if (!isMounted || dur === null) return;
        setDurations((prev) => ({ ...prev, [index]: Math.round(dur) }));
      });
    });

    return () => {
      isMounted = false;
    };
  }, [tracks, durations]);

  const currentTrack = useMemo(() => tracks[currentIndex], [tracks, currentIndex]);

  const safeCoverSrc = useMemo(() => {
    const src = currentTrack?.cover ?? coverSrc;
    if (!src) return "";
    return src;
  }, [currentTrack, coverSrc]);

  const isCoverReady = !safeCoverSrc || coverLoaded[safeCoverSrc];

  // Memoize callback to prevent AudioPlayer re-renders
  const handleNowPlayingChange = useCallback((d: { isPlaying: boolean; currentTime: number; duration: number }) => {
    setNowPlaying(d);
    if (d.isPlaying && !hasPlayed) setHasPlayed(true);
  }, [hasPlayed]);

  return (
    <div className="track-player" data-cover-ready={isCoverReady ? "true" : "false"}>
      <div className="track-player-cover-wrap">
        <CoverArt src={safeCoverSrc} />
        {hasPlayed ? (
          <div className="track-player-now">
            Now playing: {getTitle(currentTrack.context)} - {formatTime(nowPlaying.currentTime)}/{formatTime(displayDurations?.[currentIndex] ?? durations[currentIndex] ?? nowPlaying.duration)}
          </div>
        ) : null}
      </div>
      <div className="track-player-wave">
        <AudioPlayer
          key={currentTrack.file}
          src={currentTrack.file}
          waveColor={waveColor}
          progressColor={progressColor}
          showTime={false}
          title={getTitle(currentTrack.context)}
          showNowPlaying={false}
          onNowPlayingChange={handleNowPlayingChange}
        />
      </div>
      <div className="track-player-list" role="list">
        {tracks.map((track, index) => {
          const isActive = index === currentIndex;
          return (
            <button
              key={track.file}
              type="button"
              className={`track-row ${isActive ? "is-active" : ""}`}
              onClick={() => {
                if (!isActive) setCurrentIndex(index);
              }}
            >
              <span className="track-row-title">
                {showRowCover ? (
                  <span className="track-row-thumb" aria-hidden="true">
                    {(track.cover ?? rowCoverSrc ?? coverSrc) ? (
                      <Image
                        src={track.cover ?? rowCoverSrc ?? coverSrc}
                        alt=""
                        width={36}
                        height={52}
                      />
                    ) : (
                      <span className="track-row-thumb-empty" />
                    )}
                  </span>
                ) : null}
                <span className="track-row-indicator" aria-hidden="true" />
                {getTitle(track.context)}
              </span>
              <span className="track-row-time">
                {formatTime(displayDurations?.[index] ?? durations[index])}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default memo(TrackPlayer);
