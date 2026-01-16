"use client";
import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import { AudioManager } from "../lib/AudioManager";
import { formatTime } from "../lib/formatUtils";
import { useLanguage } from "../lib/LanguageContext";

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

const BAR_WIDTH = 2;
const BAR_GAP = 1;
const HEIGHT = 56;

// Convert audio URL to waveform JSON URL
function getWaveformUrl(audioSrc: string): string | null {
  // Local: /uploads/tracks/folder/file.mp3 -> /waveforms/folder/file.json
  const localMatch = audioSrc.match(/\/uploads\/tracks\/(.+)\.mp3$/i);
  if (localMatch) {
    const decoded = decodeURIComponent(localMatch[1]);
    return `/waveforms/${decoded}.json`;
  }

  // Vercel Blob: https://...blob.vercel-storage.com/tracks/musiche-i-veneti-antichi/Convivium.mp3
  // -> /waveforms/musiche i veneti antichi/Convivium.json
  const blobMatch = audioSrc.match(/blob\.vercel-storage\.com\/tracks\/([^/]+)\/([^.]+)\.mp3$/i);
  if (blobMatch) {
    // Convert kebab-case to spaces for folder: "musiche-i-veneti-antichi" -> "musiche i veneti antichi"
    const folder = blobMatch[1].replace(/-/g, ' ');
    // Filename may or may not have hyphens, convert them to spaces
    const filename = blobMatch[2].replace(/-/g, ' ');
    return `/waveforms/${folder}/${filename}.json`;
  }

  return null;
}

// Cache for loaded waveforms
const waveformCache = new Map<string, number[]>();

// Load pre-generated waveform
async function loadWaveform(audioSrc: string): Promise<number[] | null> {
  if (waveformCache.has(audioSrc)) {
    return waveformCache.get(audioSrc)!;
  }

  const url = getWaveformUrl(audioSrc);
  if (!url) return null;

  try {
    const res = await fetch(url, { cache: "force-cache" });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.peaks && Array.isArray(data.peaks)) {
      waveformCache.set(audioSrc, data.peaks);
      return data.peaks;
    }
  } catch {
    // File doesn't exist
  }
  return null;
}

function SVGWavePlayer({
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
  const { t } = useLanguage();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showVolume, setShowVolume] = useState(false);
  const [peaks, setPeaks] = useState<number[] | null>(null);
  const playerIdRef = useRef(`audio-${Math.random().toString(36).slice(2)}`);
  const svgRef = useRef<SVGSVGElement>(null);
  const rafRef = useRef<number | undefined>(undefined);
  const audioToggleRef = useRef<HTMLButtonElement | null>(null);

  const numBars = peaks?.length || 120;
  const totalWidth = numBars * (BAR_WIDTH + BAR_GAP) - BAR_GAP;

  // Load pre-generated waveform JSON (instant)
  useEffect(() => {
    let mounted = true;
    loadWaveform(src).then(loaded => {
      if (mounted && loaded) {
        setPeaks(loaded);
        onReadyChange?.(true);
      }
    });
    return () => { mounted = false; };
  }, [src, onReadyChange]);

  // Create audio element
  useEffect(() => {
    const audio = new Audio();
    audio.preload = "metadata";
    audioRef.current = audio;

    let mounted = true;

    const onMeta = () => {
      if (!mounted) return;
      setDuration(audio.duration);
    };

    const onEnded = () => {
      if (!mounted) return;
      setIsPlaying(false);
      setProgress(1);
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

    audio.src = src;

    return () => {
      mounted = false;
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("ended", onEnded);
      audio.pause();
      audio.src = "";
      AudioManager.unregister(playerIdRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [src, onNowPlayingChange]);

  // Update progress with RAF
  useEffect(() => {
    if (!isPlaying) return;

    let lastUpdate = 0;
    const update = () => {
      const audio = audioRef.current;
      if (!audio || !isPlaying) return;

      const now = performance.now();
      if (audio.duration > 0) {
        setProgress(audio.currentTime / audio.duration);
      }

      if (now - lastUpdate > 500) {
        lastUpdate = now;
        const time = Math.floor(audio.currentTime);
        setCurrentTime(time);
        onNowPlayingChange?.({ isPlaying: true, currentTime: time, duration: audio.duration });
      }

      rafRef.current = requestAnimationFrame(update);
    };

    rafRef.current = requestAnimationFrame(update);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [isPlaying, onNowPlayingChange]);

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
    const svg = svgRef.current;
    if (!audio || !svg || !duration) return;

    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, x / rect.width));
    audio.currentTime = ratio * duration;
    setProgress(ratio);
    setCurrentTime(Math.floor(audio.currentTime));
  }, [duration]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  // Close volume on outside click
  useEffect(() => {
    if (!showVolume) return;
    const onPointerDown = (e: PointerEvent) => {
      const tgt = e.target as Node;
      if (audioToggleRef.current?.contains(tgt)) return;
      setShowVolume(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowVolume(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [showVolume]);

  const progressWidth = progress * totalWidth;

  return (
    <div className="audio-player">
      <div className="audio-player-row">
        <button
          onClick={toggle}
          className="audio-play"
          aria-label={isPlaying ? t("Pausa", "Pause") : t("Riproduci", "Play")}
        >
          <span className={`audio-icon ${isPlaying ? "is-pause" : "is-play"}`} aria-hidden="true" />
        </button>

        <div className="audio-wave">
          {peaks ? (
            <svg
              ref={svgRef}
              viewBox={`0 0 ${totalWidth} ${HEIGHT}`}
              preserveAspectRatio="none"
              className="audio-wave-svg"
              onClick={seek}
              style={{ cursor: "pointer", width: "100%", height: HEIGHT, display: "block" }}
            >
              {/* Background bars */}
              {peaks.map((peak, i) => {
                const h = Math.max(0.08, peak) * HEIGHT * 0.85;
                const y = (HEIGHT - h) / 2;
                const x = i * (BAR_WIDTH + BAR_GAP);
                return (
                  <rect
                    key={i}
                    x={x}
                    y={y}
                    width={BAR_WIDTH}
                    height={h}
                    rx={1}
                    fill={waveColor}
                  />
                );
              })}
              {/* Progress overlay */}
              <clipPath id={`progress-${playerIdRef.current}`}>
                <rect x="0" y="0" width={progressWidth} height={HEIGHT} />
              </clipPath>
              <g clipPath={`url(#progress-${playerIdRef.current})`}>
                {peaks.map((peak, i) => {
                  const h = Math.max(0.08, peak) * HEIGHT * 0.85;
                  const y = (HEIGHT - h) / 2;
                  const x = i * (BAR_WIDTH + BAR_GAP);
                return (
                  <rect
                    key={i}
                    x={x}
                    y={y}
                    width={BAR_WIDTH}
                    height={h}
                    rx={1}
                    fill={progressColor}
                  />
                );
              })}
              </g>
            </svg>
          ) : (
            <div className="audio-loading">{t("Caricamento...", "Loading...")}</div>
          )}
        </div>

        {showVolumeIcon && (
          <div className={`audio-volume ${showVolume ? "is-open" : ""} is-vertical`}>
            <button
              ref={audioToggleRef}
              type="button"
              className="audio-volume-toggle"
              aria-label={t("Volume", "Volume")}
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
                style={{ position: "absolute", bottom: "100%", left: "50%", transform: "translateX(-50%) rotate(-90deg)", transformOrigin: "bottom center", width: 80 }}
              />
            )}
          </div>
        )}
      </div>
      {showTime && <div className="audio-time">{formatTime(duration)}</div>}
      {showNowPlaying && (
        <div className="now-playing">
          {t("In riproduzione", "Now playing")}: {title ?? ""} - {formatTime(currentTime)}/{formatTime(duration)}
        </div>
      )}
    </div>
  );
}

export default memo(SVGWavePlayer);
