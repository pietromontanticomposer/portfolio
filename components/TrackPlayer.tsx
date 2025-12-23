"use client";
import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import AudioPlayer from "./AudioPlayer";

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

  useEffect(() => {
    let isMounted = true;
    const audios = tracks.map((track, index) => {
      const audio = new Audio(encodeURI(track.file));
      audio.preload = "metadata";
      const onMeta = () => {
        if (!isMounted) return;
        setDurations((prev) => ({ ...prev, [index]: Math.round(audio.duration) }));
      };
      audio.addEventListener("loadedmetadata", onMeta);
      audio.addEventListener("error", onMeta);
      audio.load();
      return { audio, onMeta };
    });

    return () => {
      isMounted = false;
      audios.forEach(({ audio, onMeta }) => {
        audio.removeEventListener("loadedmetadata", onMeta);
        audio.removeEventListener("error", onMeta);
      });
    };
  }, [tracks]);

  const currentTrack = useMemo(() => tracks[currentIndex], [tracks, currentIndex]);

  const safeCoverSrc = useMemo(() => {
    const src = currentTrack?.cover ?? coverSrc;
    return encodeURI(src).replace(/'/g, "%27");
  }, [currentTrack?.cover, coverSrc]);

  return (
    <div className="track-player">
      <div className="track-player-cover-wrap">
        <div className="track-player-cover">
          <Image src={safeCoverSrc} alt="Cover art" fill sizes="140px" priority />
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
          height={92}
          showTime={false}
          title={getTitle(currentTrack.context)}
          showNowPlaying={false}
          onNowPlayingChange={(d) => {
            setNowPlaying(d);
            if (d.isPlaying && !hasPlayed) setHasPlayed(true);
          }}
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
                  <Image
                    src={encodeURI(track.cover ?? rowCoverSrc ?? coverSrc).replace(/'/g, "%27")}
                    alt=""
                    width={36}
                    height={52}
                  />
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
