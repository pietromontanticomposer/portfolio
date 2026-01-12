/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useCallback, useEffect, useRef, useState, useId } from "react";
import { AudioManager } from "../lib/AudioManager";
import { formatTime } from "../lib/formatUtils";

type CachedPeaks = {
  peaks: number[] | number[][];
  duration: number;
};

// LRU cache implementation to prevent unbounded memory growth
class LRUCache<K, V> {
  private maxSize: number;
  private cache: Map<K, V>;

  constructor(maxSize: number) {
    this.maxSize = maxSize;
    this.cache = new Map();
  }

  get(key: K): V | undefined {
    const value = this.cache.get(key);
    if (value !== undefined) {
      // Move to end (most recently used)
      this.cache.delete(key);
      this.cache.set(key, value);
    }
    return value;
  }

  set(key: K, value: V): void {
    // Remove if exists (to update position)
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }
    // Evict oldest if at capacity
    else if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(key, value);
  }
}

const normalizePeaks = (peaks: number[] | number[][]): number[][] => {
  if (!peaks || peaks.length === 0) return [];
  if (Array.isArray(peaks[0])) return peaks as number[][];
  return [peaks as number[]];
};

const getPeaksLength = (peaks: number[] | number[][]): number => {
  if (!peaks || peaks.length === 0) return 0;
  return Array.isArray(peaks[0]) ? (peaks[0] as number[]).length : (peaks as number[]).length;
};

// Cache up to 20 audio waveform peak data to reduce memory usage
const peaksCache = new LRUCache<string, CachedPeaks>(20);

const scheduleIdle = (cb: () => void) => {
  if (typeof window === "undefined") return null;
  if ("requestIdleCallback" in window) {
    return (window as any).requestIdleCallback(cb, { timeout: 2000 });
  }
  return (window as any).setTimeout(cb, 16);
};

const cancelIdle = (id: number | null) => {
  if (id == null || typeof window === "undefined") return;
  if ("cancelIdleCallback" in window) {
    (window as any).cancelIdleCallback(id);
    return;
  }
  (window as any).clearTimeout(id);
};

// Track which audio files are currently being preloaded to avoid duplicates
const preloadingSet = new Set<string>();
// Queue for sequential preloading to avoid overwhelming the browser
const preloadQueue: string[] = [];
let isProcessingQueue = false;

// Process preload queue one at a time during idle time
function processPreloadQueue() {
  if (isProcessingQueue || preloadQueue.length === 0) return;
  isProcessingQueue = true;

  const processNext = () => {
    if (preloadQueue.length === 0) {
      isProcessingQueue = false;
      return;
    }
    const src = preloadQueue.shift()!;
    if (peaksCache.get(src) || preloadingSet.has(src)) {
      scheduleIdle(processNext);
      return;
    }
    preloadingSet.add(src);

    fetch(src, { cache: "force-cache" })
      .then(res => res.arrayBuffer())
      .then(arrayBuffer => {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        return audioContext.decodeAudioData(arrayBuffer).then(audioBuffer => {
          const channelData = audioBuffer.getChannelData(0);
          const duration = audioBuffer.duration;
          const targetLength = 512;
          const samplesPerPeak = Math.floor(channelData.length / targetLength);
          const peaks: number[] = new Array(targetLength);

          for (let i = 0; i < targetLength; i++) {
            const start = i * samplesPerPeak;
            const end = Math.min(start + samplesPerPeak, channelData.length);
            let max = 0;
            for (let j = start; j < end; j++) {
              const abs = Math.abs(channelData[j]);
              if (abs > max) max = abs;
            }
            peaks[i] = Math.round(max * 100) / 100;
          }

          peaksCache.set(src, { peaks: [peaks], duration });
          audioContext.close();
        });
      })
      .catch(() => {})
      .finally(() => {
        preloadingSet.delete(src);
        scheduleIdle(processNext);
      });
  };

  scheduleIdle(processNext);
}

// Queue audio file for preloading (non-blocking)
export function preloadWaveformPeaks(src: string): void {
  if (!src || typeof window === "undefined") return;
  if (peaksCache.get(src)) return;
  if (preloadingSet.has(src)) return;
  if (preloadQueue.includes(src)) return;

  preloadQueue.push(src);
  processPreloadQueue();
}

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

const WAVE_HEIGHT = 56;
const PEAKS_MIN_LENGTH = 256;
const PEAKS_MAX_LENGTH = 2000;
const PEAKS_PER_SECOND = 10;
const PEAKS_PRECISION = 100;

const getDesiredPeaksLength = (node: HTMLDivElement | null, ws: any, duration = 0): number => {
  const width = node?.clientWidth || node?.parentElement?.clientWidth || 0;
  const barW = (ws?.params && (ws.params as any).barWidth) || 2;
  const barG = (ws?.params && (ws.params as any).barGap) || 1;
  const span = Math.max(1, barW + barG);
  const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
  const lengthByWidth = width ? Math.round((width / span) * dpr) : 0;
  const lengthByDuration = duration > 0 ? Math.round(duration * PEAKS_PER_SECOND) : 0;
  const desired = Math.max(PEAKS_MIN_LENGTH, lengthByWidth, lengthByDuration);
  return Math.min(PEAKS_MAX_LENGTH, desired);
};

export default function AudioPlayer({
  src,
  waveColor = "#60a5fa",
  progressColor = "#1e3a8a",
  showTime = true,
  showVolumeIcon = true,
  title,
  showNowPlaying = false,
  onReadyChange,
  onNowPlayingChange,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const wsRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const isPlayingRef = useRef(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showVolume, setShowVolume] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const audioToggleRef = useRef<HTMLButtonElement | null>(null);
  const popoverRef = useRef<HTMLLabelElement | null>(null);
  const isDraggingRef = useRef(false);
  const currentTimeRef = useRef(0);
  const lastUpdateTimeRef = useRef(0);
  const onNowPlayingChangeRef = useRef(onNowPlayingChange);
  const onReadyChangeRef = useRef(onReadyChange);
  const durationRef = useRef(duration);
  const volumeRef = useRef(volume);
  const playerIdRef = useRef<string>("");
  const reactId = useId();
  const pendingPlayRef = useRef(false);
  const srcRef = useRef(src);
  const hasReadyRef = useRef(false);
  const lastLoadedSrcRef = useRef<string | null>(null);
  const idleIdRef = useRef<number | null>(null);
  const shouldCacheRef = useRef(false);
  const desiredLengthRef = useRef(0);
  const pointerCleanupRef = useRef<(() => void) | null>(null);
  const usedCachedRef = useRef(false);

  if (!playerIdRef.current) {
    playerIdRef.current = `wave-${reactId}`;
  }

  useEffect(() => {
    onNowPlayingChangeRef.current = onNowPlayingChange;
  }, [onNowPlayingChange]);

  useEffect(() => {
    onReadyChangeRef.current = onReadyChange;
  }, [onReadyChange]);

  useEffect(() => {
    durationRef.current = duration;
  }, [duration]);

  useEffect(() => {
    volumeRef.current = volume;
  }, [volume]);

  useEffect(() => {
    srcRef.current = src;
  }, [src]);

  const loadTrack = useCallback((nextSrc: string) => {
    const ws = wsRef.current;
    const node = containerRef.current;
    if (!ws || !node) return;
    if (!nextSrc) return;

    if (lastLoadedSrcRef.current === nextSrc) return;

    lastLoadedSrcRef.current = nextSrc;
    cancelIdle(idleIdRef.current);
    idleIdRef.current = null;

    try {
      ws.pause();
    } catch {}
    try {
      ws.setTime(0);
    } catch {}
    isPlayingRef.current = false;
    setIsPlaying(false);
    currentTimeRef.current = 0;
    setCurrentTime(0);

    const cached = peaksCache.get(nextSrc);
    const cachedDuration = cached?.duration ?? 0;
    const desiredLength = getDesiredPeaksLength(node, ws, cachedDuration);
    desiredLengthRef.current = desiredLength;
    const cachedPeaks = cached ? normalizePeaks(cached.peaks) : null;
    const cachedLength = cached ? getPeaksLength(cached.peaks) : 0;
    const useCached = !!(cached && cachedPeaks && cachedLength >= desiredLength);
    usedCachedRef.current = useCached;
    shouldCacheRef.current = !useCached;

    setIsReady(false);
    hasReadyRef.current = false;
    if (typeof onReadyChangeRef.current === "function") {
      onReadyChangeRef.current(false);
    }

    const loadResult = useCached && cached && cachedPeaks ? ws.load(nextSrc, cachedPeaks, cached.duration) : ws.load(nextSrc);
    if (loadResult && typeof (loadResult as Promise<void>).catch === "function") {
      (loadResult as Promise<void>).catch(() => {
        // Swallow AbortError when component unmounts mid-load.
      });
    }
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    let ws: any = null;
    let mounted = true;
    let resizeObserver: ResizeObserver | null = null;
    let resizeHandler: (() => void) | null = null;
    let hasInitialized = false;

    const initWaveSurfer = () => {
      if (hasInitialized || !mounted || !containerRef.current) return;
      hasInitialized = true;

      // Dynamic import WaveSurfer to reduce initial bundle size (~50KB)
      import("wavesurfer.js").then((WaveSurferModule) => {
        if (!mounted || !containerRef.current) return;

        const WaveSurfer = WaveSurferModule.default;
        // create wavesurfer
        if (containerRef.current) {
          containerRef.current.innerHTML = "";
        }
        ws = WaveSurfer.create({
          container: containerRef.current,
          waveColor,
          progressColor,
          cursorColor: "transparent",
          cursorWidth: 0,
          normalize: false,
          splitChannels: false,
          height: WAVE_HEIGHT,
          barWidth: 3,
          barGap: 2,
          barRadius: 2,
          barMinHeight: 1,
          backend: "WebAudio",
          fetchParams: { cache: "force-cache" },
        } as any);
        wsRef.current = ws;
        AudioManager.register(
          playerIdRef.current,
          ws,
          () => {
            try {
              ws.pause();
            } catch {}
          },
          () => {
            try {
              ws.destroy();
            } catch {}
          }
        );
        ws.setVolume(volumeRef.current);

        let lastWidth = 0;
        const syncWidth = () => {
          if (!containerRef.current) return;
          const parent = containerRef.current.parentElement;
          const nextWidth = parent?.clientWidth ?? containerRef.current.clientWidth;
          if (!nextWidth || nextWidth === lastWidth) return;
          lastWidth = nextWidth;
          ws.setOptions({ width: nextWidth, height: WAVE_HEIGHT, splitChannels: false });
          const nextLength = getDesiredPeaksLength(containerRef.current, ws, durationRef.current);
          if (nextLength > desiredLengthRef.current) {
            desiredLengthRef.current = nextLength;
          }
        };
        if (typeof ResizeObserver !== "undefined") {
          resizeObserver = new ResizeObserver(() => {
            syncWidth();
          });
          resizeObserver.observe(containerRef.current.parentElement ?? containerRef.current);
        } else {
          resizeHandler = syncWidth;
          window.addEventListener("resize", resizeHandler);
        }
        // Ensure correct width after initial layout.
        requestAnimationFrame(syncWidth);

        loadTrack(srcRef.current);

        ws.on("ready", () => {
          const nextDuration = ws.getDuration() || 0;
          hasReadyRef.current = true;
          setIsReady(true);
          durationRef.current = nextDuration;
          setDuration(nextDuration);
          if (typeof onReadyChangeRef.current === "function") {
            onReadyChangeRef.current(true);
          }
          if (pendingPlayRef.current) {
            pendingPlayRef.current = false;
            try {
              ws.play();
            } catch {}
          }
          if (typeof onNowPlayingChangeRef.current === "function") {
            onNowPlayingChangeRef.current({
              isPlaying: isPlayingRef.current,
              currentTime: currentTimeRef.current,
              duration: nextDuration,
            });
          }
          const cacheSrc = lastLoadedSrcRef.current;
          if (cacheSrc) {
            const desiredLength = getDesiredPeaksLength(containerRef.current, ws, nextDuration);
            if (desiredLength > desiredLengthRef.current) {
              desiredLengthRef.current = desiredLength;
            }
            const cached = peaksCache.get(cacheSrc);
            const cachedLength = cached ? getPeaksLength(cached.peaks) : 0;
            const needsBetterPeaks = cachedLength < desiredLengthRef.current;
            if (shouldCacheRef.current || needsBetterPeaks) {
              shouldCacheRef.current = false;
              const cacheLength = desiredLengthRef.current;
              idleIdRef.current = scheduleIdle(() => {
                if (wsRef.current !== ws || !containerRef.current) return;
                const length = Math.max(cacheLength, getDesiredPeaksLength(containerRef.current, ws, nextDuration));
                let peaks: number[][] = [];
                try {
                  peaks = normalizePeaks(ws.exportPeaks({ channels: 2, maxLength: length, precision: PEAKS_PRECISION }) as number[][]);
                } catch {
                  peaks = normalizePeaks(ws.exportPeaks({ channels: 2, maxLength: length, precision: PEAKS_PRECISION }) as number[][]);
                }
                if (!peaks.length) return;
                peaksCache.set(cacheSrc, { peaks, duration: nextDuration });
                if (usedCachedRef.current) {
                  ws.setOptions({ peaks, duration: nextDuration } as any);
                }
              });
            }
          }
        });

        ws.on("audioprocess", (t: number) => {
          const now = performance.now();
          const flooredTime = Math.floor(t);
          const prevTime = currentTimeRef.current;

          // Throttle updates to 2 times per second (500ms) for better performance
          if (now - lastUpdateTimeRef.current >= 500 && flooredTime !== prevTime) {
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
          const endDuration = ws.getDuration() || 0;
          durationRef.current = endDuration;
          if (typeof onNowPlayingChangeRef.current === "function") {
            onNowPlayingChangeRef.current({
              isPlaying: false,
              currentTime: Math.floor(ws.getDuration() || 0),
              duration: endDuration,
            });
          }
        });
      }).catch((err) => {
        console.error("Failed to load WaveSurfer:", err);
      });
    };

    initWaveSurfer();

    return () => {
      mounted = false;
      if (resizeObserver) resizeObserver.disconnect();
      if (resizeHandler) window.removeEventListener("resize", resizeHandler);
      setIsReady(false);
      hasReadyRef.current = false;
      if (typeof onReadyChangeRef.current === "function") {
        onReadyChangeRef.current(false);
      }
      lastLoadedSrcRef.current = null;
      shouldCacheRef.current = false;
      desiredLengthRef.current = 0;
      cancelIdle(idleIdRef.current);
      idleIdRef.current = null;

      // Clean up any active pointer event listeners
      if (pointerCleanupRef.current) {
        pointerCleanupRef.current();
        pointerCleanupRef.current = null;
      }

      if (ws) {
        try {
          ws.unAll();
          ws.destroy();
        } catch {
          // Ignore teardown errors from rapidly changing sources.
        } finally {
          if (wsRef.current === ws) wsRef.current = null;
        }
      }
      AudioManager.unregister(playerIdRef.current);
    };
  }, [loadTrack, waveColor, progressColor]);

  useEffect(() => {
    if (!src) return;
    if (!wsRef.current) return;
    loadTrack(src);
  }, [loadTrack, src]);

  useEffect(() => {
    if (!wsRef.current) return;
    wsRef.current.setVolume(volume);
  }, [volume]);
  const toggleVolumePopover = () => {
    setShowVolume((v) => !v);
  };

  // Pointer-based drag handling for vertical slider
  const handlePointerMove = (clientY: number) => {
    if (!popoverRef.current) return;
    const rect = popoverRef.current.getBoundingClientRect();
    const padding = 14; // match CSS --slider-padding
    const inner = rect.height - padding * 2;
    const rel = clientY - rect.top - padding;
    const frac = 1 - Math.min(Math.max(rel / inner, 0), 1);
    setVolume(Number(frac.toFixed(2)));
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    e.preventDefault();

    // Clean up any existing pointer listeners before adding new ones
    if (pointerCleanupRef.current) {
      pointerCleanupRef.current();
      pointerCleanupRef.current = null;
    }

    isDraggingRef.current = true;
    try { (e.target as Element).setPointerCapture?.(e.pointerId); } catch {}
    handlePointerMove(e.clientY);
    const onMove = (ev: PointerEvent) => handlePointerMove(ev.clientY);
    const onUp = () => {
      isDraggingRef.current = false;
      try { (e.target as Element).releasePointerCapture?.(e.pointerId); } catch {}
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      pointerCleanupRef.current = null;
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);

    // Store cleanup function to call on unmount
    pointerCleanupRef.current = () => {
      isDraggingRef.current = false;
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  };

  // close popover on click outside or Escape
  useEffect(() => {
    if (!showVolume) return;
    function onPointerDown(e: PointerEvent) {
      const tgt = e.target as Node | null;
      if (audioToggleRef.current && (audioToggleRef.current === tgt || audioToggleRef.current.contains(tgt))) return;
      if (popoverRef.current && (popoverRef.current === tgt || popoverRef.current.contains(tgt))) return;
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

  const toggle = () => {
    if (!wsRef.current) {
      pendingPlayRef.current = true;
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
