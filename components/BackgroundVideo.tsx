/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { memo, useCallback, useEffect, useRef, useState } from "react";

const DEBUG_BG =
  process.env.NEXT_PUBLIC_BG_DEBUG === "1" ||
  process.env.NEXT_PUBLIC_BG_DEBUG === "true";

function BackgroundVideo() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [shouldLoadSrc, setShouldLoadSrc] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const isPlayingRef = useRef(false);
  const hasLoadedRef = useRef(false);

  // Read localStorage after mount to avoid hydration mismatch
  useEffect(() => {
    setHasMounted(true);
    const savedPauseState = localStorage.getItem('bg-video-paused') === 'true';
    if (savedPauseState) {
      setIsPaused(true);
    }
  }, []);

  // Delay load to not block initial render and scroll
  useEffect(() => {
    if (hasLoadedRef.current) return;

    // Wait for page to be interactive before loading video
    const timer = setTimeout(() => {
      if (!hasLoadedRef.current) {
        hasLoadedRef.current = true;
        setShouldLoadSrc(true);
      }
    }, 1500); // Delay 1.5s to prioritize main content

    return () => clearTimeout(timer);
  }, []);

  // Attach sources and attempt playback
  useEffect(() => {
    if (!shouldLoadSrc || !videoRef.current) return;
    const video = videoRef.current;

    // Diagnostic logging to help debug playback issues
    const log = (...args: any[]) => {
      if (!DEBUG_BG) return;
      try {
        console.debug('[BackgroundVideo]', ...args);
      } catch {}
    };

    const logError = (...args: any[]) => {
      try {
        if (!DEBUG_BG) {
          console.error('[BackgroundVideo]', ...args);
          return;
        }
        const videoState = video
          ? { readyState: video.readyState, networkState: video.networkState, src: (video as any).currentSrc || video.src }
          : null;
        const serialized = args.map((a) => {
          try {
            if (typeof a === 'string') return a;
            return JSON.stringify(a);
          } catch {
            try {
              return String(a);
            } catch {
              return '<unserializable>';
            }
          }
        });
        console.error('[BackgroundVideo]', ...args, { videoState, serialized });
      } catch {}
    };
    const isPowerSaveAbort = (err: any) => {
      const name = err?.name ? String(err.name) : "";
      const message = err?.message ? String(err.message).toLowerCase() : "";
      return name === "AbortError" && message.includes("paused to save power");
    };
    const isAbortDuringLoad = (err: any) => {
      const name = err?.name ? String(err.name) : "";
      const message = err?.message ? String(err.message).toLowerCase() : "";
      return name === "AbortError" && message.includes("interrupted by a new load request");
    };

    let hls: any = null;
    let HlsClass: any = null;
    let connectionChangeHandler: (() => void) | null = null;
    let lastTime = 0;
    let lastAdvance = performance.now();
    let lastRecoverAt = 0;
    let stallCount = 0;
    let hasSource = false;
    let mounted = true;
    const timeoutIds: ReturnType<typeof setTimeout>[] = [];

    const tryPlayImmediate = () => {
      if (!hasSource || !mounted) return;
      try {
        video.muted = true;
      } catch {}
      const p = video.play();
      if (p && typeof (p as Promise<void>).then === "function") {
        (p as Promise<void>)
          .then(() => log('video.play() succeeded'))
          .catch((err) => {
            if (err?.name === "NotSupportedError") return;
            if (isPowerSaveAbort(err)) {
              log('video.play() blocked by power saver', err);
              return;
            }
            if (isAbortDuringLoad(err)) return;
            logError('video.play() rejected', err, { paused: video.paused, readyState: video.readyState, networkState: video.networkState });
          });
      }
    };

    try {
      video.muted = true;
      video.playsInline = true;
      try {
        (video as any).crossOrigin = "anonymous";
        try {
          video.setAttribute('crossorigin', 'anonymous');
        } catch {}
      } catch {}
      try {
        video.autoplay = true;
      } catch {}

      const hlsUrl =
        process.env.NEXT_PUBLIC_BG_HLS_URL ||
        "https://4glkq64bdlmmple5.public.blob.vercel-storage.com/hls/background/master.m3u8";

      // Dynamic import HLS.js to reduce initial bundle (~80KB)
      import("hls.js").then((HlsModule) => {
        if (!mounted) return;
        HlsClass = HlsModule.default;

        if (HlsClass.isSupported()) {
          hls = new HlsClass({
            enableWorker: true,
            lowLatencyMode: false,
            capLevelToPlayerSize: true,
            startLevel: 0,
            backBufferLength: 1,
            maxBufferLength: 3,
            maxMaxBufferLength: 6,
            maxBufferSize: 3 * 1000 * 1000,
            maxBufferHole: 0.5,
            abrBandWidthFactor: 0.65,
            abrBandWidthUpFactor: 0.55,
            fragLoadingTimeOut: 10000,
            fragLoadingMaxRetry: 4,
            fragLoadingRetryDelay: 1000,
            fragLoadingMaxRetryTimeout: 8000,
            manifestLoadingMaxRetry: 4,
            manifestLoadingRetryDelay: 1000,
            manifestLoadingMaxRetryTimeout: 8000,
          });
          hls.loadSource(hlsUrl);
          hls.attachMedia(video);
          hasSource = true;

          const chooseCapLevel = () => {
            if (!hls) return;
            const conn = (navigator as any).connection;
            const downlink = typeof conn?.downlink === "number" ? conn.downlink : null;
            const saveData = !!conn?.saveData;
            const isLowPower =
              window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
              window.matchMedia("(pointer: coarse)").matches;
            const vw = video.videoWidth || video.clientWidth || window.innerWidth;

            let maxHeight = 720;
            if (saveData) {
              maxHeight = 360;
            } else if (downlink !== null) {
              if (downlink <= 1.5) maxHeight = 360;
              else if (downlink <= 3) maxHeight = 540;
              else if (downlink <= 6) maxHeight = 720;
              else maxHeight = 900;
            } else if (isLowPower) {
              maxHeight = 540;
            }

            const limit = Math.min(maxHeight, vw);
            const level = hls.levels?.findIndex(
              (l: any) => (l?.height ?? 0) > 0 && (l?.height ?? 0) <= limit
            );
            if (typeof level === "number" && level >= 0) {
              hls.autoLevelCapping = level;
            }
          };

          hls.on(HlsClass.Events.MANIFEST_PARSED, chooseCapLevel);
          hls.on(HlsClass.Events.MEDIA_ATTACHED, () => log('HLS MEDIA_ATTACHED'));
          hls.on(HlsClass.Events.BUFFER_APPENDED, () => log('HLS BUFFER_APPENDED'));
          const conn = (navigator as any).connection;
          if (conn && typeof conn.addEventListener === "function") {
            connectionChangeHandler = chooseCapLevel;
            conn.addEventListener("change", connectionChangeHandler);
          }

          hls.on(HlsClass.Events.ERROR, (_event: any, data: any) => {
            try {
              const info = {
                type: data?.type,
                details: data?.details,
                fatal: data?.fatal,
                response: data?.response
                  ? {
                    url: (data.response as any)?.url || (data.response as any)?.uri,
                    code: (data.response as any)?.code,
                    text: (data.response as any)?.text
                  }
                  : null,
                context: data?.context
                  ? {
                      fragUrl: (data.context as any)?.frag?.url,
                      fragByteRange: (data.context as any)?.frag?.byteRange,
                      loader: (data.context as any)?.loader?.url,
                      type: (data.context as any)?.type,
                    }
                  : null,
              };
              log('HLS ERROR EVENT', info, _event);
            } catch (e) {
              logError('Error serializing HLS error', e, data);
            }

            if (data?.details === HlsClass.ErrorDetails.BUFFER_STALLED_ERROR) {
              hls?.startLoad();
              tryPlayImmediate();
              return;
            }

            if (!data?.fatal) {
              log('HLS non-fatal error', data);
              return;
            }

            logError('HLS fatal error', data);
            if (data.type === HlsClass.ErrorTypes.NETWORK_ERROR) {
              hls?.startLoad();
            } else if (data.type === HlsClass.ErrorTypes.MEDIA_ERROR) {
              hls?.recoverMediaError();
            } else {
              try {
                hls?.destroy();
              } catch (e) {
                logError('Error destroying HLS instance', e);
              }
            }
          });

          // Start playback after HLS is ready
          tryPlayImmediate();
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          // Safari: native HLS
          try {
            video.src = hlsUrl;
            hasSource = true;
            tryPlayImmediate();
          } catch {}
        }

        if (hasSource) {
          video.preload = "metadata";
          video.load();
        }
      }).catch((err) => {
        logError('Failed to load HLS.js', err);
      });

    } catch {
      // ignore
    }

    const onPlaying = () => {
      isPlayingRef.current = true;
      setIsPlaying(true);
      lastAdvance = performance.now();
    };
    const onPause = () => {
      isPlayingRef.current = false;
      setIsPlaying(false);
    };
    const onCanPlay = () => tryPlayImmediate();
    const onCanPlayThrough = () => tryPlayImmediate();
    const onWaiting = () => {
      const id = setTimeout(() => {
        if (mounted) tryPlayImmediate();
      }, 250);
      timeoutIds.push(id);
    };
    const onStalled = () => {
      const id = setTimeout(() => {
        if (mounted) tryPlayImmediate();
      }, 500);
      timeoutIds.push(id);
    };
    const onTimeUpdate = () => {
      if (video.currentTime !== lastTime) {
        lastTime = video.currentTime;
        lastAdvance = performance.now();
      }
    };

    video.addEventListener("playing", onPlaying, { passive: true });
    video.addEventListener("pause", onPause, { passive: true });
    video.addEventListener("canplay", onCanPlay, { passive: true });
    video.addEventListener("canplaythrough", onCanPlayThrough, { passive: true });
    video.addEventListener("waiting", onWaiting, { passive: true });
    video.addEventListener("stalled", onStalled, { passive: true });
    video.addEventListener("timeupdate", onTimeUpdate, { passive: true });
    const onError = (e: Event) => {
      try {
        const mediaError = video.error;
        const errorInfo = mediaError
          ? { code: mediaError.code, message: mediaError.message }
          : null;
        if (mediaError?.code === 4) return;
        console.error('[BackgroundVideo] video element error', e, {
          readyState: video.readyState,
          networkState: video.networkState,
          error: errorInfo,
        });
      } catch {}
    };
    video.addEventListener("error", onError);

    // Watchdog interval optimized for smooth performance
    const watchdogId = window.setInterval(() => {
      if (document.hidden) return;
      if (video.paused || video.seeking || !isPlayingRef.current) return;
      const sinceAdvance = performance.now() - lastAdvance;
      if (sinceAdvance < 7000) return;
      const now = performance.now();
      if (now - lastRecoverAt < 5000) return;
      lastRecoverAt = now;
      stallCount += 1;
      try {
        if (hls && HlsClass) {
          if (stallCount % 3 === 0) {
            hls.stopLoad();
            hls.detachMedia();
            hls.attachMedia(video);
          }
          hls.startLoad();
          hls.recoverMediaError();
        }
        if (video.readyState < 2) {
          video.load();
        }
        if (video.currentTime > 0.1) {
          video.currentTime = Math.max(0, video.currentTime - 0.05);
        }
        tryPlayImmediate();
      } catch {}
    }, 7000);

    return () => {
      mounted = false;

      // Clear all tracked timeouts
      timeoutIds.forEach((id) => clearTimeout(id));
      timeoutIds.length = 0;

      // Remove all event listeners
      video.removeEventListener("playing", onPlaying);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("canplay", onCanPlay);
      video.removeEventListener("canplaythrough", onCanPlayThrough);
      video.removeEventListener("waiting", onWaiting);
      video.removeEventListener("stalled", onStalled);
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("error", onError);

      // Clear watchdog interval
      if (watchdogId) window.clearInterval(watchdogId);

      // Remove connection change listener
      const conn = (navigator as any).connection;
      if (conn && connectionChangeHandler && typeof conn.removeEventListener === "function") {
        conn.removeEventListener("change", connectionChangeHandler);
        connectionChangeHandler = null;
      }

      // Destroy HLS instance
      if (hls) {
        try {
          hls.destroy();
          hls = null;
        } catch {}
      }
    };
  }, [shouldLoadSrc]);

  const togglePause = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    
    if (isPaused) {
      video.play().catch(() => {});
      setIsPaused(false);
      localStorage.setItem('bg-video-paused', 'false');
    } else {
      video.pause();
      setIsPaused(true);
      localStorage.setItem('bg-video-paused', 'true');
    }
  }, [isPaused]);

  // Apply saved pause state when video loads
  useEffect(() => {
    if (!shouldLoadSrc || !videoRef.current) return;
    const video = videoRef.current;
    
    // Only pause if user explicitly paused (localStorage has 'true')
    const savedPauseState = localStorage.getItem('bg-video-paused') === 'true';
    
    if (savedPauseState) {
      video.pause();
    }

    // Handle page visibility changes (tab switch)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Don't do anything when tab is hidden - let browser handle it
        return;
      } else {
        // When returning to tab, respect saved pause state
        const pauseState = localStorage.getItem('bg-video-paused') === 'true';
        if (pauseState) {
          video.pause();
        }
        // If not paused, video should continue playing (browser handles this)
      }
    };

    // Intercept play events only if user has explicitly paused
    const handlePlay = () => {
      const pauseState = localStorage.getItem('bg-video-paused') === 'true';
      if (pauseState) {
        video.pause();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    video.addEventListener('play', handlePlay);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      video.removeEventListener('play', handlePlay);
    };
  }, [shouldLoadSrc]);

  return (
    <>
      <video
        ref={videoRef}
        className={`bg-video ${isPlaying ? "is-visible" : ""}`}
        autoPlay
        preload="metadata"
        muted
        loop
        playsInline
        disablePictureInPicture
        controlsList="nodownload noremoteplayback"
        poster="https://4glkq64bdlmmple5.public.blob.vercel-storage.com/background-poster.jpg"
        aria-hidden="true"
        style={{
          transform: "translate3d(0, 0, 0)",
          willChange: "transform",
          contain: "strict",
          isolation: "isolate",
          backfaceVisibility: "hidden",
          perspective: 1000
        }}
      />

      <div
        className={`bg-video-poster ${isPlaying || isPaused ? "is-hidden" : ""}`}
        style={{
          backgroundImage: `url('https://4glkq64bdlmmple5.public.blob.vercel-storage.com/background-poster.jpg')`,
          transform: "translate3d(0, 0, 0)",
          willChange: "transform",
          contain: "strict",
          isolation: "isolate",
          backfaceVisibility: "hidden",
          perspective: 1000
        }}
        aria-hidden="true"
      />

      <div
        className="bg-video-overlay"
        aria-hidden="true"
        style={{
          transform: "translate3d(0, 0, 0)",
          willChange: "transform",
          contain: "strict",
          isolation: "isolate",
          backfaceVisibility: "hidden",
          perspective: 1000
        }}
      />

      <div className="bg-video-toggle">
        <span className="bg-video-toggle-label">Block background video</span>
        <button
          onClick={togglePause}
          className="bg-video-toggle-btn"
          aria-label={isPaused ? "Play background video" : "Pause background video"}
          title={isPaused ? "Play background" : "Pause background"}
        >
          {isPaused ? (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M5 3.5v9l7-4.5-7-4.5z" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M4 3h3v10H4V3zm5 0h3v10H9V3z" />
            </svg>
          )}
        </button>
      </div>
    </>
  );
}

export default memo(BackgroundVideo);
