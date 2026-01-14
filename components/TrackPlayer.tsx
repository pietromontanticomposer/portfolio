"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import AudioPlayer, { prefetchWaveform, preloadWaveSurfer, getCachedDuration } from "./AudioPlayer";

type Track = {
  file: string;
  context: string;
  cover?: string;
};

type Props = {
  tracks: Track[];
  coverSrc: string;
  waveColor?: string;
  progressColor?: string;
  showRowCover?: boolean;
  rowCoverSrc?: string;
};

const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds <= 0) return "--:--";
  const mm = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const ss = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${mm}:${ss}`;
};

const getTitle = (context: string) => {
  const split = context.split("—");
  return split[0]?.trim() || context;
};

export default function TrackPlayer({
  tracks,
  coverSrc,
  waveColor = "#5b4bff",
  progressColor = "#4338ca",
  showRowCover = false,
  rowCoverSrc,
}: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [durations, setDurations] = useState<Record<number, number>>({});
  const [nowPlaying, setNowPlaying] = useState<{ isPlaying: boolean; currentTime: number; duration: number }>({ isPlaying: false, currentTime: 0, duration: 0 });
  const [hasPlayed, setHasPlayed] = useState(false);

  // Prefetch all waveforms on mount + preload WaveSurfer module
  useEffect(() => {
    preloadWaveSurfer();
    tracks.forEach((track, idx) => {
      prefetchWaveform(track.file);
    });
  }, [tracks]);

  // Update durations from cache as they become available
  useEffect(() => {
    const interval = setInterval(() => {
      let updated = false;
      const newDurations = { ...durations };
      tracks.forEach((track, idx) => {
        if (newDurations[idx] === undefined) {
          const cached = getCachedDuration(track.file);
          if (cached) {
            newDurations[idx] = cached;
            updated = true;
          }
        }
      });
      if (updated) setDurations(newDurations);
      // Stop checking once all durations are loaded
      if (Object.keys(newDurations).length === tracks.length) {
        clearInterval(interval);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [tracks, durations]);

  const currentTrack = useMemo(() => tracks[currentIndex], [tracks, currentIndex]);

  const safeCoverSrc = (() => {
    const src = currentTrack?.cover ?? coverSrc;
    if (!src) return '';
    return src;
  })();

  // Memoize callback to prevent AudioPlayer re-renders
  const handleNowPlayingChange = useCallback((d: { isPlaying: boolean; currentTime: number; duration: number }) => {
    setNowPlaying(d);
    if (d.isPlaying && !hasPlayed) setHasPlayed(true);
    // Update duration from AudioPlayer if not cached
    if (d.duration && !durations[currentIndex]) {
      setDurations(prev => ({ ...prev, [currentIndex]: Math.round(d.duration) }));
    }
  }, [hasPlayed, currentIndex, durations]);

  return (
    <div className="track-player">
      <div className="track-player-cover-wrap">
        <div className="track-player-cover">
          {safeCoverSrc ? (
            <Image src={safeCoverSrc} alt="Cover art" fill sizes="140px" />
          ) : (
            <div className="track-player-cover-empty" />
          )}
        </div>
        {hasPlayed ? (
          <div className="track-player-now">
            Now playing: {getTitle(currentTrack.context)} - {formatTime(nowPlaying.currentTime)}/{formatTime(durations[currentIndex] ?? nowPlaying.duration)}
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
        {tracks.map((track, index) => (
          <button
            key={track.file}
            type="button"
            className={`track-row ${index === currentIndex ? "is-active" : ""}`}
            onClick={() => setCurrentIndex(index)}
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
              {index === currentIndex ? (
                <span className="track-row-indicator" aria-hidden="true" />
              ) : null}
              {getTitle(track.context)}
            </span>
            <span className="track-row-time">{formatTime(durations[index])}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
