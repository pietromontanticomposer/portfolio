"use client";
import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import { AudioManager } from "../lib/AudioManager";
import { formatTime } from "../lib/formatUtils";

type Props = {
  src: string;
  waveColor?: string;
  progressColor?: string;
  showTime?: boolean;
  showVolumeIcon?: boolean;
  title?: string;
  showNowPlaying?: boolean;
  onReadyChange?: (ready: boolean) => void;
  onNowPlayingChange?: (data: { isPlaying: boolean; currentTime: number; duration: number }) => void;
};

// Generate deterministic waveform from src string
function generateWaveform(src: string, bars: number): number[] {
  let hash = 0;
  for (let i = 0; i < src.length; i++) {
    hash = ((hash << 5) - hash + src.charCodeAt(i)) | 0;
  }
  const peaks: number[] = [];
  for (let i = 0; i < bars; i++) {
    hash = ((hash * 1103515245 + 12345) | 0) >>> 0;
    const base = 0.25 + ((hash % 1000) / 1000) * 0.5;
    peaks.push(base);
  }
  return peaks;
}

const BARS = 150;
const BAR_WIDTH = 2;
const BAR_GAP = 1;
const HEIGHT = 56;

function LightAudioPlayer({
  src,
  waveColor = "#5b4bff",
  progressColor = "#4338ca",
  showTime = true,
  showVolumeIcon = true,
  title,
  showNowPlaying = false,
  onReadyChange,
  onNowPlayingChange,
}: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showVolume, setShowVolume] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const playerIdRef = useRef(`audio-${Math.random().toString(36).slice(2)}`);
  const waveformRef = useRef<SVGSVGElement>(null);
  const progressRef = useRef(0);
  const rafRef = useRef<number | undefined>(undefined);

  const peaks = React.useMemo(() => generateWaveform(src, BARS), [src]);
  const totalWidth = BARS * (BAR_WIDTH + BAR_GAP) - BAR_GAP;

  // Create audio element
  useEffect(() => {
    const audio = new Audio();
    audio.preload = "metadata";
    audio.src = src;
    audioRef.current = audio;

    const onMeta = () => {
      setDuration(audio.duration);
      setIsReady(true);
      onReadyChange?.(true);
    };
    const onEnded = () => {
      setIsPlaying(false);
      onNowPlayingChange?.({ isPlaying: false, currentTime: audio.duration, duration: audio.duration });
    };

    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("ended", onEnded);

    AudioManager.register(
      playerIdRef.current,
      { pause: () => audio.pause() },
      () => audio.pause(),
      () => { audio.src = ""; }
    );

    return () => {
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("ended", onEnded);
      audio.pause();
      audio.src = "";
      AudioManager.unregister(playerIdRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [src, onReadyChange, onNowPlayingChange]);

  // Update progress with RAF
  useEffect(() => {
    if (!isPlaying) return;

    let lastUpdate = 0;
    const update = () => {
      const audio = audioRef.current;
      if (!audio) return;

      const now = performance.now();
      if (now - lastUpdate > 250) {
        lastUpdate = now;
        const time = Math.floor(audio.currentTime);
        if (time !== currentTime) {
          setCurrentTime(time);
          onNowPlayingChange?.({ isPlaying: true, currentTime: time, duration: audio.duration });
        }
      }

      // Update progress bar smoothly
      progressRef.current = audio.duration > 0 ? audio.currentTime / audio.duration : 0;
      if (waveformRef.current) {
        const mask = waveformRef.current.querySelector("#progress-mask rect") as SVGRectElement;
        if (mask) mask.setAttribute("width", `${progressRef.current * 100}%`);
      }

      rafRef.current = requestAnimationFrame(update);
    };

    rafRef.current = requestAnimationFrame(update);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [isPlaying, currentTime, onNowPlayingChange]);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      AudioManager.setActive(playerIdRef.current);
      audio.play().catch(() => {});
      setIsPlaying(true);
    }
  }, [isPlaying]);

  const seek = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const audio = audioRef.current;
    const svg = waveformRef.current;
    if (!audio || !svg || !duration) return;

    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, x / rect.width));
    audio.currentTime = ratio * duration;
    setCurrentTime(Math.floor(audio.currentTime));
  }, [duration]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  return (
    <div className="audio-player">
      <div className="audio-player-row">
        <button onClick={toggle} className="audio-play" aria-label={isPlaying ? "Pause" : "Play"}>
          <span className={`audio-icon ${isPlaying ? "is-pause" : "is-play"}`} aria-hidden="true" />
        </button>

        <div className="audio-wave">
          <svg
            ref={waveformRef}
            viewBox={`0 0 ${totalWidth} ${HEIGHT}`}
            preserveAspectRatio="none"
            className="audio-wave-svg"
            onClick={seek}
            style={{ cursor: "pointer", width: "100%", height: HEIGHT }}
          >
            <defs>
              <mask id={`mask-${playerIdRef.current}`}>
                <rect x="0" y="0" width="100%" height="100%" fill="white" />
              </mask>
              <clipPath id={`progress-mask`}>
                <rect x="0" y="0" width="0%" height="100%" />
              </clipPath>
            </defs>

            {/* Background bars */}
            <g fill={waveColor}>
              {peaks.map((peak, i) => {
                const h = peak * HEIGHT * 0.9;
                const y = (HEIGHT - h) / 2;
                return (
                  <rect
                    key={i}
                    x={i * (BAR_WIDTH + BAR_GAP)}
                    y={y}
                    width={BAR_WIDTH}
                    height={h}
                    rx={1.5}
                  />
                );
              })}
            </g>

            {/* Progress overlay */}
            <g fill={progressColor} clipPath={`url(#progress-mask)`}>
              {peaks.map((peak, i) => {
                const h = peak * HEIGHT * 0.9;
                const y = (HEIGHT - h) / 2;
                return (
                  <rect
                    key={i}
                    x={i * (BAR_WIDTH + BAR_GAP)}
                    y={y}
                    width={BAR_WIDTH}
                    height={h}
                    rx={1.5}
                  />
                );
              })}
            </g>
          </svg>
        </div>

        {showVolumeIcon && (
          <div className={`audio-volume ${showVolume ? "is-open" : ""} is-vertical`}>
            <button
              type="button"
              className="audio-volume-toggle"
              aria-label="Volume"
              onClick={() => setShowVolume(v => !v)}
            >
              <svg className="audio-volume-svg" viewBox="0 0 24 24" width="22" height="22">
                <path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" />
                <path d="M14.5 8.5a3.5 3.5 0 010 7" stroke="currentColor" strokeWidth="1.6" fill="none" />
                <path d="M17.5 6a6 6 0 010 12" stroke="currentColor" strokeWidth="1.2" fill="none" />
              </svg>
            </button>
            {showVolume && (
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="audio-volume-range"
              />
            )}
          </div>
        )}
      </div>
      {showTime && <div className="audio-time">{formatTime(duration)}</div>}
      {showNowPlaying && (
        <div className="now-playing">
          Now playing: {title ?? ""} - {formatTime(currentTime)}/{formatTime(duration)}
        </div>
      )}
    </div>
  );
}

export default memo(LightAudioPlayer);
