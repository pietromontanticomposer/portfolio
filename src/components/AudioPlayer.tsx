"use client";
import React, { useEffect, useRef, useState } from "react";

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
  height?: number;
  showTime?: boolean;
  showVolumeIcon?: boolean;
  title?: string;
  showNowPlaying?: boolean;
  onNowPlayingChange?: (data: { isPlaying: boolean; currentTime: number; duration: number }) => void;
};

export default function AudioPlayer({
  src,
  waveColor = "#60a5fa",
  progressColor = "#1e3a8a",
  height = 80,
  showTime = true,
  showVolumeIcon = true,
  title,
  showNowPlaying = false,
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

  useEffect(() => {
    if (!containerRef.current) return;

    let ws: any = null;
    let mounted = true;
    let resizeObserver: ResizeObserver | null = null;
    let idleId: number | null = null;

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
        responsive: true,
        normalize: true,
        height,
        barWidth: 2,
        barGap: 1,
        barRadius: 2,
        backend: 'MediaElement',
      } as any);
      wsRef.current = ws;
      ws.setVolume(volume);

      const syncWidth = () => {
        if (!containerRef.current) return;
        ws.setOptions({ width: containerRef.current.clientWidth });
      };
      if (typeof ResizeObserver !== "undefined") {
        resizeObserver = new ResizeObserver(() => {
          syncWidth();
        });
        resizeObserver.observe(containerRef.current);
      } else {
        window.addEventListener("resize", syncWidth);
      }
      // Ensure correct width after initial layout.
      requestAnimationFrame(syncWidth);

      const safeSrc = encodeURI(src);
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
        setDuration(nextDuration);
        if (typeof onNowPlayingChange === "function") {
          onNowPlayingChange({ isPlaying: isPlayingRef.current, currentTime, duration: nextDuration });
        }
      });

      ws.on("audioprocess", (t: number) => {
        const now = performance.now();
        const flooredTime = Math.floor(t);
        currentTimeRef.current = flooredTime;

        // Throttle updates to 4-5 times per second (200-250ms)
        if (now - lastUpdateTimeRef.current >= 200 && flooredTime !== currentTime) {
          lastUpdateTimeRef.current = now;
          setCurrentTime(flooredTime);
          if (typeof onNowPlayingChange === "function") {
            onNowPlayingChange({ isPlaying: isPlayingRef.current, currentTime: flooredTime, duration });
          }
        }
      });

      ws.on("play", () => {
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
        if (typeof onNowPlayingChange === "function") {
          onNowPlayingChange({ isPlaying: false, currentTime: Math.floor(ws.getDuration() || 0), duration: Math.round(ws.getDuration() || 0) });
        }
      });
    }).catch((err) => {
      console.error("Failed to load WaveSurfer:", err);
    });

    return () => {
      mounted = false;
      if (resizeObserver) resizeObserver.disconnect();
      if (typeof window !== "undefined") {
        window.removeEventListener("resize", () => {});
      }
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
    };
  }, [src, waveColor, progressColor, height]);

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
    const onUp = (ev: PointerEvent) => {
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

  const toggle = () => {
    if (!wsRef.current) return;
    const next = !isPlayingRef.current;
    isPlayingRef.current = next;
    wsRef.current.playPause();
    setIsPlaying(next);
    if (typeof onNowPlayingChange === "function") {
      onNowPlayingChange({ isPlaying: next, currentTime, duration });
    }
  };

  return (
    <div className="audio-player">
      <button onClick={toggle} className="audio-play" aria-label={isPlaying ? "Pause" : "Play"}>
        <span className={`audio-icon ${isPlaying ? "is-pause" : "is-play"}`} aria-hidden="true" />
        <span className="sr-only">{isPlaying ? "Pause" : "Play"}</span>
      </button>
      <div className="audio-wave">
        <div ref={containerRef} />
        {!isReady ? <div className="audio-loading">Loading audio...</div> : null}
      </div>
      {showTime ? <div className="audio-time">{formatTime(duration)}</div> : null}
      {showNowPlaying ? (
        <div className="now-playing">Now playing: {title ?? ''} - {formatTime(currentTime)}/{formatTime(duration)}</div>
      ) : null}
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
  );
}
