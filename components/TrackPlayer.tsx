"use client";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import AudioPlayer from "./AudioPlayer";
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

  const safeCoverSrc = (() => {
    const src = currentTrack?.cover ?? coverSrc;
    if (!src) return '';
    return src;
  })();

  // Memoize callback to prevent AudioPlayer re-renders
  const handleNowPlayingChange = useCallback((d: { isPlaying: boolean; currentTime: number; duration: number }) => {
    setNowPlaying(d);
    if (d.isPlaying && !hasPlayed) setHasPlayed(true);
  }, [hasPlayed]);

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
            <span className="track-row-time">
              {formatTime(displayDurations?.[index] ?? durations[index])}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default memo(TrackPlayer);