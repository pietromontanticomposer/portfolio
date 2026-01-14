/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useRef, useState, useId } from "react";
import { AudioManager } from "../lib/AudioManager";

type CachedPeaks = {
  peaks: number[];
  duration: number;
};

const peaksCache = new Map<string, CachedPeaks>();

// Preload WaveSurfer module in background
let waveSurferPromise: Promise<any> | null = null;
export function preloadWaveSurfer() {
  if (!waveSurferPromise && typeof window !== "undefined") {
    waveSurferPromise = import("wavesurfer.js");
  }
  return waveSurferPromise;
}

// Prefetch waveform JSON (non-blocking, for next tracks)
export function prefetchWaveform(src: string) {
  if (peaksCache.has(src)) return;
  const url = getWaveformUrl(src);
  if (url) {
    fetch(url, { cache: "force-cache" }).then(r => r.json()).then(data => {
      if (data?.peaks) peaksCache.set(src, { peaks: data.peaks, duration: data.duration || 0 });
    }).catch(() => {});
  }
}

// Get cached duration (for TrackPlayer)
export function getCachedDuration(src: string): number | null {
  return peaksCache.get(src)?.duration || null;
}

// Convert audio URL to waveform JSON URL
function getWaveformUrl(audioSrc: string): string | null {
  // Local: /uploads/tracks/folder/file.mp3 -> /waveforms/folder/file.json
  const localMatch = audioSrc.match(/\/uploads\/tracks\/(.+)\.mp3$/i);
  if (localMatch) {
    return `/waveforms/${decodeURIComponent(localMatch[1])}.json`;
  }
  // Vercel Blob: tracks/folder/filename.mp3 -> /waveforms/folder/filename.json
  const blobMatch = audioSrc.match(/blob\.vercel-storage\.com\/tracks\/([^/]+)\/([^.]+)\.mp3$/i);
  if (blobMatch) {
    // Convert folder: selected-tracks -> selected tracks, musiche-claudio-re -> musiche claudio re
    const folder = blobMatch[1].replace(/-/g, ' ');
    // Convert filename: remove -alt suffix, convert hyphens to spaces
    let filename = blobMatch[2].replace(/-alt$/, '').replace(/-/g, ' ');
    return `/waveforms/${folder}/${filename}.json`;
  }
  return null;
}

// Load pre-generated waveform JSON (cached)
async function loadWaveformJson(src: string): Promise<CachedPeaks | null> {
  const cached = peaksCache.get(src);
  if (cached) return cached;

  const url = getWaveformUrl(src);
  if (!url) return null;

  try {
    const res = await fetch(url, { cache: "force-cache" });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.peaks && Array.isArray(data.peaks)) {
      const result = { peaks: data.peaks, duration: data.duration || 0 };
      peaksCache.set(src, result);
      return result;
    }
  } catch {}
  return null;
}

const formatTime = (s: number) => {
  const mm = Math.floor(s / 60).toString().padStart(2, "0");
  const ss = Math.floor(s % 60).toString().padStart(2, "0");
  return `${mm}:${ss}`;
};

type Props = {
  src: string;
  waveColor?: string;
  progressColor?: string;
  showTime?: boolean;
  showVolumeIcon?: boolean;
  title?: string;
  showNowPlaying?: boolean;
  onNowPlayingChange?: (data: { isPlaying: boolean; currentTime: number; duration: number }) => void;
};

const WAVE_HEIGHT = 56;

export default function AudioPlayer({
  src,
  waveColor = "#60a5fa",
  progressColor = "#1e3a8a",
  showTime = true,
  showVolumeIcon = true,
  title,
  showNowPlaying = false,
  onNowPlayingChange,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const wsRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [shouldInit, setShouldInit] = useState(false);
  const isPlayingRef = useRef(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showVolume, setShowVolume] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [preloadedPeaks, setPreloadedPeaks] = useState<CachedPeaks | null>(null);
  const audioToggleRef = useRef<HTMLButtonElement | null>(null);
  const popoverRef = useRef<HTMLLabelElement | null>(null);
  const isDraggingRef = useRef(false);
  const currentTimeRef = useRef(0);
  const lastUpdateTimeRef = useRef(0);
  const onNowPlayingChangeRef = useRef(onNowPlayingChange);
  const durationRef = useRef(duration);
  const volumeRef = useRef(volume);
  const playerIdRef = useRef<string>("");
  const reactId = useId();
  const pendingPlayRef = useRef(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  if (!playerIdRef.current) {
    playerIdRef.current = `wave-${reactId}`;
  }

  useEffect(() => { onNowPlayingChangeRef.current = onNowPlayingChange; }, [onNowPlayingChange]);
  useEffect(() => { durationRef.current = duration; }, [duration]);
  useEffect(() => { volumeRef.current = volume; }, [volume]);

  // Pre-load waveform JSON immediately on mount (fast ~1KB fetch)
  useEffect(() => {
    let mounted = true;
    loadWaveformJson(src).then(data => {
      if (mounted && data) {
        setPreloadedPeaks(data);
        if (data.duration) setDuration(data.duration);
      }
    });
    return () => { mounted = false; };
  }, [src]);

  // Intersection observer for lazy WaveSurfer init
  useEffect(() => {
    if (shouldInit) return;
    const node = containerRef.current;
    if (!node || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldInit(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px 0px" }
    );
    observer.observe(node);
    observerRef.current = observer;
    return () => observer.disconnect();
  }, [shouldInit]);

  // Initialize WaveSurfer
  useEffect(() => {
    if (!containerRef.current || !shouldInit) return;

    let ws: any = null;
    let mounted = true;
    let resizeObserver: ResizeObserver | null = null;

    const initWaveSurfer = async () => {
      if (!mounted || !containerRef.current) return;

      // Load peaks if not already loaded
      let peaks = preloadedPeaks;
      if (!peaks) {
        peaks = await loadWaveformJson(src);
      }

      if (!mounted || !containerRef.current) return;

      const WaveSurferModule = await (waveSurferPromise || import("wavesurfer.js"));
      if (!mounted || !containerRef.current) return;

      const WaveSurfer = WaveSurferModule.default;
      ws = WaveSurfer.create({
        container: containerRef.current,
        waveColor,
        progressColor,
        cursorColor: "transparent",
        cursorWidth: 0,
        normalize: true,
        height: WAVE_HEIGHT,
        barWidth: 2,
        barGap: 1,
        barRadius: 2,
        backend: "MediaElement",
        mediaControls: false,
      } as any);
      wsRef.current = ws;

      AudioManager.register(
        playerIdRef.current,
        ws,
        () => { try { ws.pause(); } catch {} },
        () => { try { ws.destroy(); } catch {} }
      );
      ws.setVolume(volumeRef.current);

      // Resize handling
      let lastWidth = 0;
      const syncWidth = () => {
        if (!containerRef.current) return;
        const parent = containerRef.current.parentElement;
        const nextWidth = parent?.clientWidth ?? containerRef.current.clientWidth;
        if (!nextWidth || nextWidth === lastWidth) return;
        lastWidth = nextWidth;
        ws.setOptions({ width: nextWidth, height: WAVE_HEIGHT });
      };
      if (typeof ResizeObserver !== "undefined") {
        resizeObserver = new ResizeObserver(syncWidth);
        resizeObserver.observe(containerRef.current.parentElement ?? containerRef.current);
      }
      requestAnimationFrame(syncWidth);

      // Load with pre-computed peaks for instant waveform display
      if (peaks) {
        ws.load(src, [peaks.peaks], peaks.duration);
      } else {
        ws.load(src);
      }

      ws.on("ready", () => {
        const nextDuration = Math.round(ws.getDuration());
        setIsReady(true);
        durationRef.current = nextDuration;
        setDuration(nextDuration);
        if (pendingPlayRef.current) {
          pendingPlayRef.current = false;
          try { ws.play(); } catch {}
        }
        if (typeof onNowPlayingChangeRef.current === "function") {
          onNowPlayingChangeRef.current({
            isPlaying: isPlayingRef.current,
            currentTime: currentTimeRef.current,
            duration: nextDuration,
          });
        }
      });

      ws.on("audioprocess", (t: number) => {
        const now = performance.now();
        const flooredTime = Math.floor(t);
        if (now - lastUpdateTimeRef.current >= 200 && flooredTime !== currentTimeRef.current) {
          lastUpdateTimeRef.current = now;
          currentTimeRef.current = flooredTime;
          setCurrentTime(flooredTime);
          if (typeof onNowPlayingChangeRef.current === "function") {
            onNowPlayingChangeRef.current({
              isPlaying: isPlayingRef.current,
              currentTime: flooredTime,
              duration: durationRef.current,
            });
          }
        }
      });

      ws.on("play", () => {
        AudioManager.setActive(playerIdRef.current);
        isPlayingRef.current = true;
        setIsPlaying(true);
      });
      ws.on("pause", () => {
        isPlayingRef.current = false;
        setIsPlaying(false);
      });
      ws.on("finish", () => {
        isPlayingRef.current = false;
        setIsPlaying(false);
        const endDuration = Math.round(ws.getDuration() || 0);
        durationRef.current = endDuration;
        if (typeof onNowPlayingChangeRef.current === "function") {
          onNowPlayingChangeRef.current({
            isPlaying: false,
            currentTime: Math.floor(ws.getDuration() || 0),
            duration: endDuration,
          });
        }
      });
    };

    initWaveSurfer();

    return () => {
      mounted = false;
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      if (resizeObserver) resizeObserver.disconnect();
      setIsReady(false);
      if (ws) {
        try { ws.unAll(); ws.destroy(); } catch {}
        if (wsRef.current === ws) wsRef.current = null;
      }
      AudioManager.unregister(playerIdRef.current);
    };
  }, [src, waveColor, progressColor, shouldInit, preloadedPeaks]);

  useEffect(() => {
    if (wsRef.current) wsRef.current.setVolume(volume);
  }, [volume]);

  const toggleVolumePopover = () => setShowVolume((v) => !v);

  const handlePointerMove = (clientY: number) => {
    if (!popoverRef.current) return;
    const rect = popoverRef.current.getBoundingClientRect();
    const padding = 14;
    const inner = rect.height - padding * 2;
    const rel = clientY - rect.top - padding;
    const frac = 1 - Math.min(Math.max(rel / inner, 0), 1);
    setVolume(Number(frac.toFixed(2)));
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    e.preventDefault();
    isDraggingRef.current = true;
    try { (e.target as Element).setPointerCapture?.(e.pointerId); } catch {}
    handlePointerMove(e.clientY);
    const onMove = (ev: PointerEvent) => handlePointerMove(ev.clientY);
    const onUp = () => {
      isDraggingRef.current = false;
      try { (e.target as Element).releasePointerCapture?.(e.pointerId); } catch {}
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  useEffect(() => {
    if (!showVolume) return;
    function onPointerDown(e: PointerEvent) {
      const tgt = e.target as Node | null;
      if (audioToggleRef.current?.contains(tgt as Node)) return;
      if (popoverRef.current?.contains(tgt as Node)) return;
      setShowVolume(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setShowVolume(false);
    }
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [showVolume]);

  const requestInit = () => {
    if (!shouldInit) setShouldInit(true);
  };

  const toggle = () => {
    if (!wsRef.current) {
      pendingPlayRef.current = true;
      requestInit();
      return;
    }
    const next = !isPlayingRef.current;
    isPlayingRef.current = next;
    wsRef.current.playPause();
    setIsPlaying(next);
    if (typeof onNowPlayingChangeRef.current === "function") {
      onNowPlayingChangeRef.current({
        isPlaying: next,
        currentTime: currentTimeRef.current,
        duration: durationRef.current,
      });
    }
  };

  return (
    <div
      className={`audio-player ${showVolume ? "is-volume-open" : ""}`}
      onPointerEnter={requestInit}
      onFocus={requestInit}
    >
      <div className="audio-player-row">
        <button onClick={toggle} className="audio-play" aria-label={isPlaying ? "Pause" : "Play"}>
          <span className={`audio-icon ${isPlaying ? "is-pause" : "is-play"}`} aria-hidden="true" />
          <span className="sr-only">{isPlaying ? "Pause" : "Play"}</span>
        </button>
        <div className="audio-wave">
          <div ref={containerRef} className="audio-wave-container" />
          {!isReady ? <div className="audio-loading">Loading audio...</div> : null}
        </div>
        {showVolumeIcon ? (
          <div translate="no" className={`audio-volume notranslate ${showVolume ? 'is-open' : ''} is-vertical`} style={{ ["--volume-accent" as any]: waveColor, ["--volume-fill" as any]: volume }}>
            <button
              type="button"
              className="audio-volume-toggle"
              aria-label="Volume"
              aria-expanded={showVolume}
              ref={audioToggleRef}
              onClick={toggleVolumePopover}
            >
              <svg className="audio-volume-svg" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
                <path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" />
                <path d="M14.5 8.5a3.5 3.5 0 010 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                <path d="M17.5 6a6 6 0 010 12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
            </button>
            <label
              ref={popoverRef}
              className={`audio-volume-slider notranslate ${showVolume ? "is-open" : ""}`}
              aria-hidden={!showVolume}
              style={{ ["--volume-fill" as any]: volume }}
              onPointerDown={onPointerDown}
              translate="no"
              data-no-translate="1"
            >
              <span className="sr-only">Volume</span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={(event) => setVolume(Number(event.target.value))}
                aria-label="Volume"
                style={{ pointerEvents: 'none' }}
              />
              <span translate="no" className="slider-thumb notranslate" aria-hidden="true" />
            </label>
          </div>
        ) : null}
      </div>
      {showTime ? <div className="audio-time">{formatTime(duration)}</div> : null}
      {showNowPlaying ? (
        <div className="now-playing">Now playing: {title ?? ''} - {formatTime(currentTime)}/{formatTime(duration)}</div>
      ) : null}
    </div>
  );
}
