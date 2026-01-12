"use client";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import AudioPlayer, { preloadWaveformPeaks } from "./AudioPlayer";
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
  const [isWaveReady, setIsWaveReady] = useState(false);
  const [coverLoaded, setCoverLoaded] = useState<Record<string, boolean>>({});

  // Preload all covers and waveforms on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const seenCovers = new Set<string>();
    const seenAudio = new Set<string>();

    tracks.forEach((track) => {
      // Preload cover
      const coverUrl = track.cover ?? coverSrc;
      if (coverUrl && !seenCovers.has(coverUrl)) {
        seenCovers.add(coverUrl);
        const img = new window.Image();
        img.onload = () => setCoverLoaded((prev) => ({ ...prev, [coverUrl]: true }));
        img.onerror = () => setCoverLoaded((prev) => ({ ...prev, [coverUrl]: true }));
        img.src = coverUrl;
      }

      // Preload waveform peaks
      if (track.file && !seenAudio.has(track.file)) {
        seenAudio.add(track.file);
        preloadWaveformPeaks(track.file);
      }
    });
  }, [tracks, coverSrc]);

  // Preload only current + next track metadata
  useEffect(() => {
    let isMounted = true;
    const audios: { audio: HTMLAudioElement; onMeta: () => void; index: number }[] = [];

    // Load current and next track only
    const indicesToLoad = [currentIndex, currentIndex + 1].filter(
      (idx) => idx < tracks.length && durations[idx] === undefined
    );

    indicesToLoad.forEach((index) => {
      const track = tracks[index];
      const audio = new Audio(track.file);
      audio.preload = "metadata";
      const onMeta = () => {
        if (!isMounted) return;
        setDurations((prev) => ({ ...prev, [index]: Math.round(audio.duration) }));
      };
      audio.addEventListener("loadedmetadata", onMeta);
      audio.addEventListener("error", onMeta);
      audio.load();
      audios.push({ audio, onMeta, index });
    });

    return () => {
      isMounted = false;
      audios.forEach(({ audio, onMeta }) => {
        audio.removeEventListener("loadedmetadata", onMeta);
        audio.removeEventListener("error", onMeta);
      });
    };
  }, [tracks, currentIndex, durations]);

  const currentTrack = useMemo(() => tracks[currentIndex], [tracks, currentIndex]);

  const safeCoverSrc = useMemo(() => {
    const src = currentTrack?.cover ?? coverSrc;
    if (!src) return "";
    return src;
  }, [currentTrack, coverSrc]);

  const isCoverReady = !safeCoverSrc || coverLoaded[safeCoverSrc];

  useEffect(() => {
    setIsWaveReady(false);
  }, [currentTrack?.file]);

  // Memoize callback to prevent AudioPlayer re-renders
  const handleNowPlayingChange = useCallback((d: { isPlaying: boolean; currentTime: number; duration: number }) => {
    setNowPlaying(d);
    if (d.isPlaying && !hasPlayed) setHasPlayed(true);
  }, [hasPlayed]);
  const handleWaveReadyChange = useCallback((ready: boolean) => setIsWaveReady(ready), []);
  const isVisualReady = isCoverReady && isWaveReady;

  return (
    <div className="track-player" data-visual-ready={isVisualReady ? "true" : "false"}>
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
          src={currentTrack.file}
          waveColor={waveColor}
          progressColor={progressColor}
          showTime={false}
          title={getTitle(currentTrack.context)}
          showNowPlaying={false}
          onNowPlayingChange={handleNowPlayingChange}
          onReadyChange={handleWaveReadyChange}
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
