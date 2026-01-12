/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useCallback, useEffect, useRef, useState, useId } from "react";
import { AudioManager } from "../lib/AudioManager";
import { formatTime } from "../lib/formatUtils";

let waveSurferImport: Promise<any> | null = null;
const loadWaveSurfer = () => {
  if (!waveSurferImport) {
    waveSurferImport = import("wavesurfer.js");
  }
  return waveSurferImport;
};

type CachedPeaks = {
  peaks: number[] | number[][];
  duration: number;
};

const normalizePeaks = (peaks: number[] | number[][]): number[][] => {
  if (!peaks || peaks.length === 0) return [];
  if (Array.isArray(peaks[0])) return peaks as number[][];
  return [peaks as number[]];
};

const getPeaksLength = (peaks: number[] | number[][]): number => {
  if (!peaks || peaks.length === 0) return 0;
  return Array.isArray(peaks[0]) ? (peaks[0] as number[]).length : (peaks as number[]).length;
};

// Cache waveform peaks in-memory for the session
const peaksCache = new Map<string, CachedPeaks>();

// Convert audio URL to waveform JSON URL
function getWaveformUrl(audioSrc: string): string | null {
  // /uploads/tracks/folder/file.mp3 -> /waveforms/folder/file.json
  const match = audioSrc.match(/\/uploads\/tracks\/(.+)\.mp3$/i);
  if (!match) return null;
  return `/waveforms/${match[1]}.json`;
}

// Load pre-generated waveform JSON
async function loadPreGeneratedPeaks(audioSrc: string): Promise<CachedPeaks | null> {
  const url = getWaveformUrl(audioSrc);
  if (!url) return null;

  try {
    const res = await fetch(url, { cache: "force-cache" });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.peaks && Array.isArray(data.peaks)) {
      return { peaks: data.peaks, duration: data.duration || 0 };
    }
  } catch {
    // Waveform file doesn't exist, will decode audio instead
  }
  return null;
}

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

// Track which waveforms are being prefetched to avoid duplicates
const prefetchingWaveforms = new Set<string>();

export function preloadWaveformJson(src: string): void {
  if (!src || typeof window === "undefined") return;
  if (peaksCache.get(src)) return;
  if (prefetchingWaveforms.has(src)) return;

  prefetchingWaveforms.add(src);
  loadPreGeneratedPeaks(src)
    .then((preGenerated) => {
      if (!preGenerated) return;
      peaksCache.set(src, preGenerated);
    })
    .catch(() => {})
    .finally(() => {
      prefetchingWaveforms.delete(src);
    });
}

// Batch preload multiple waveform JSONs in parallel (non-blocking)
export function preloadWaveformJsonBatch(sources: string[]): void {
  if (typeof window === "undefined") return;
  sources.forEach((src) => preloadWaveformJson(src));
}

// Get cached duration for a source (returns undefined if not cached)
export function getCachedDuration(src: string): number | undefined {
  const cached = peaksCache.get(src);
  return cached?.duration;
}

// Load duration from waveform JSON (faster than loading audio metadata)
export async function loadDurationFromWaveform(src: string): Promise<number | null> {
  const cached = peaksCache.get(src);
  if (cached?.duration) return cached.duration;

  const preGenerated = await loadPreGeneratedPeaks(src);
  if (preGenerated) {
    peaksCache.set(src, preGenerated);
    return preGenerated.duration;
  }
  return null;
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
  const [shouldInit, setShouldInit] = useState(false);
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
  const initRequestedRef = useRef(false);
  const srcRef = useRef(src);
  const hasReadyRef = useRef(false);
  const lastLoadedSrcRef = useRef<string | null>(null);
  const idleIdRef = useRef<number | null>(null);
  const initIdleIdRef = useRef<number | null>(null);
  const pointerCleanupRef = useRef<(() => void) | null>(null);
  const visualReadyRef = useRef(false);

  if (!playerIdRef.current) {
    playerIdRef.current = `wave-${reactId}`;
  }

  const requestInit = useCallback(() => {
    if (initRequestedRef.current) return;
    initRequestedRef.current = true;
    setShouldInit(true);
  }, []);

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

  useEffect(() => {
    if (shouldInit) return;
    const node = containerRef.current;
    if (!node) return;

    if (typeof IntersectionObserver === "undefined") {
      requestInit();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          requestInit();
          observer.disconnect();
        }
      },
      { rootMargin: "600px 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [requestInit, shouldInit]);

  const loadTrack = useCallback(async (nextSrc: string) => {
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

    setIsReady(false);
    hasReadyRef.current = false;
    visualReadyRef.current = false;
    if (typeof onReadyChangeRef.current === "function") {
      onReadyChangeRef.current(false);
    }

    // Try to load pre-generated waveform first (fast!)
    let cached = peaksCache.get(nextSrc);
    if (!cached) {
      const preGenerated = await loadPreGeneratedPeaks(nextSrc);
      if (preGenerated) {
        peaksCache.set(nextSrc, preGenerated);
        cached = preGenerated;
      }
    }

    const cachedPeaks = cached ? normalizePeaks(cached.peaks) : null;
    const useCached = !!(cached && cachedPeaks && cachedPeaks.length > 0);

    const loadResult = useCached && cached && cachedPeaks ? ws.load(nextSrc, cachedPeaks, cached.duration) : ws.load(nextSrc);
    if (loadResult && typeof (loadResult as Promise<void>).catch === "function") {
      (loadResult as Promise<void>).catch(() => {
        // Swallow AbortError when component unmounts mid-load.
      });
    }
  }, []);

  useEffect(() => {
    if (!shouldInit || !containerRef.current) return;

    let ws: any = null;
    let mounted = true;
    let resizeObserver: ResizeObserver | null = null;
    let resizeHandler: (() => void) | null = null;
    let hasInitialized = false;

    const initWaveSurfer = () => {
      if (hasInitialized || !mounted || !containerRef.current) return;
      hasInitialized = true;

      // Dynamic import WaveSurfer to reduce initial bundle size (~50KB)
      loadWaveSurfer().then((WaveSurferModule) => {
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
          normalize: true,
          splitChannels: false,
          height: WAVE_HEIGHT,
          barWidth: 3,
          barGap: 2,
          barRadius: 2,
          barMinHeight: 1,
          backend: "MediaElement",
          sampleRate: 4000,
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

        ws.on("redraw", () => {
          if (visualReadyRef.current) return;
          visualReadyRef.current = true;
          if (typeof onReadyChangeRef.current === "function") {
            onReadyChangeRef.current(true);
          }
        });

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
          // Update cache with duration if we loaded from pre-generated JSON
          const cacheSrc = lastLoadedSrcRef.current;
          if (cacheSrc) {
            const cached = peaksCache.get(cacheSrc);
            if (cached && !cached.duration) {
              // Only update duration, keep existing peaks (don't recalculate)
              peaksCache.set(cacheSrc, { peaks: cached.peaks, duration: nextDuration });
            }
          }
        });

        ws.on("audioprocess", (t: number) => {
          const now = performance.now();
          const flooredTime = Math.floor(t);
          const prevTime = currentTimeRef.current;

          // Throttle updates to ~5 times per second (200ms) for better performance
          if (now - lastUpdateTimeRef.current >= 200 && flooredTime !== prevTime) {
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

    initIdleIdRef.current = scheduleIdle(() => {
      initIdleIdRef.current = null;
      initWaveSurfer();
    });

    return () => {
      mounted = false;
      cancelIdle(initIdleIdRef.current);
      initIdleIdRef.current = null;
      if (resizeObserver) resizeObserver.disconnect();
      if (resizeHandler) window.removeEventListener("resize", resizeHandler);
      setIsReady(false);
      hasReadyRef.current = false;
      if (typeof onReadyChangeRef.current === "function") {
        onReadyChangeRef.current(false);
      }
      lastLoadedSrcRef.current = null;
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
  }, [loadTrack, shouldInit, waveColor, progressColor]);

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
    if (!wsRef.current || !hasReadyRef.current) {
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
      onFocusCapture={requestInit}
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
