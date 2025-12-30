/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useRef, useState, useId } from "react";
import { AudioManager } from "../lib/AudioManager";

type CachedPeaks = {
  peaks: Array<number[]>;
  duration: number;
};

const peaksCache = new Map<string, CachedPeaks>();

const scheduleIdle = (cb: () => void) => {
  if (typeof window === "undefined") return null;
  if ("requestIdleCallback" in window) {
    return (window as any).requestIdleCallback(cb, { timeout: 1500 });
  }
  return (window as any).setTimeout(cb, 0);
};

const cancelIdle = (id: number | null) => {
  if (id == null || typeof window === "undefined") return;
  if ("cancelIdleCallback" in window) {
    (window as any).cancelIdleCallback(id);
    return;
  }
  (window as any).clearTimeout(id);
};

// Move format function outside component to prevent recreation
const formatTime = (s: number) => {
  const mm = Math.floor(s / 60)
    .toString()
    .padStart(2, "0");
  const ss = Math.floor(s % 60)
    .toString()
    .padStart(2, "0");
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

  useEffect(() => {
    onNowPlayingChangeRef.current = onNowPlayingChange;
  }, [onNowPlayingChange]);

  useEffect(() => {
    durationRef.current = duration;
  }, [duration]);

  useEffect(() => {
    volumeRef.current = volume;
  }, [volume]);

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
      { rootMargin: "300px 0px" }
    );
    observer.observe(node);
    observerRef.current = observer;
    return () => observer.disconnect();
  }, [shouldInit]);

  useEffect(() => {
    if (!containerRef.current) return;
    if (!shouldInit) return;

    let ws: any = null;
    let mounted = true;
    let resizeObserver: ResizeObserver | null = null;
    let resizeHandler: (() => void) | null = null;
    let idleId: number | null = null;
    let hasInitialized = false;

    const initWaveSurfer = () => {
      if (hasInitialized || !mounted || !containerRef.current) return;
      hasInitialized = true;

      // Dynamic import WaveSurfer to reduce initial bundle size (~50KB)
      import("wavesurfer.js").then((WaveSurferModule) => {
        if (!mounted || !containerRef.current) return;

        const WaveSurfer = WaveSurferModule.default;
        // create wavesurfer
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
          ws.setOptions({ width: nextWidth, height: WAVE_HEIGHT });
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

        const safeSrc = src;
        // Determine desired peaks length based on container width and bar sizing
        const barW = (ws.params && (ws.params as any).barWidth) || 2;
        const barG = (ws.params && (ws.params as any).barGap) || 1;
        const desiredLength = Math.max(512, Math.round(containerRef.current!.clientWidth / (barW + barG)));

        const cached = peaksCache.get(safeSrc);
        let loadResult: any;
        if (cached && Array.isArray(cached.peaks) && cached.peaks.length === desiredLength) {
          loadResult = ws.load(safeSrc, cached.peaks, cached.duration);
        } else {
          loadResult = ws.load(safeSrc);
        }
        if (loadResult && typeof (loadResult as Promise<void>).catch === "function") {
          (loadResult as Promise<void>).catch(() => {
            // Swallow AbortError when component unmounts mid-load.
          });
        }

        ws.on("ready", () => {
          const nextDuration = Math.round(ws.getDuration());
          if (!cached) {
            idleId = scheduleIdle(() => {
              if (wsRef.current !== ws || !containerRef.current) return;
              const barW2 = (ws.params && (ws.params as any).barWidth) || 2;
              const barG2 = (ws.params && (ws.params as any).barGap) || 1;
              const length = Math.max(512, Math.round(containerRef.current.clientWidth / (barW2 + barG2)));
              let peaks: any;
              try {
                if (ws.backend && typeof (ws.backend as any).getPeaks === 'function') {
                  peaks = Array.from((ws.backend as any).getPeaks(length));
                } else {
                  peaks = ws.exportPeaks({ maxLength: length, precision: 2 });
                }
              } catch {
                peaks = ws.exportPeaks({ maxLength: length, precision: 2 });
              }
              peaksCache.set(safeSrc, { peaks, duration: nextDuration });
            });
          }
          setIsReady(true);
          durationRef.current = nextDuration;
          setDuration(nextDuration);
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
        });

        ws.on("audioprocess", (t: number) => {
          const now = performance.now();
          const flooredTime = Math.floor(t);
          const prevTime = currentTimeRef.current;

          // Throttle updates to 4-5 times per second (200-250ms)
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
      }).catch((err) => {
        console.error("Failed to load WaveSurfer:", err);
      });
    };

    const startWhenIdle = () => {
      if ("requestIdleCallback" in window) {
        (window as any).requestIdleCallback(initWaveSurfer, { timeout: 1200 });
      } else {
        setTimeout(initWaveSurfer, 0);
      }
    };

    startWhenIdle();

    return () => {
      mounted = false;
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      if (resizeObserver) resizeObserver.disconnect();
      if (resizeHandler) window.removeEventListener("resize", resizeHandler);
      setIsReady(false);
      cancelIdle(idleId);
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
  }, [src, waveColor, progressColor, shouldInit]);

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
