/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { memo, useEffect, useRef, useState } from "react";
import { useLanguage } from "../lib/LanguageContext";
import useResumeVideoOnVisibility from "./useResumeVideoOnVisibility";

const DEBUG_BG =
  process.env.NEXT_PUBLIC_BG_DEBUG === "1" ||
  process.env.NEXT_PUBLIC_BG_DEBUG === "true";

function BackgroundVideo() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const { t } = useLanguage();
  const [shouldLoadSrc, setShouldLoadSrc] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const isPlayingRef = useRef(false);
  const hasLoadedRef = useRef(false);
  const isPausedRef = useRef(false);
  const pausedTimeRef = useRef<number | null>(null);

  useResumeVideoOnVisibility(videoRef, { keepPlayingWhenHidden: true });

  // Load video immediately for faster start
  useEffect(() => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;
    setShouldLoadSrc(true);
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
    let hlsFatalCount = 0;
    let hasSource = false;
    let mounted = true;
    let fallbackUsed = false;
    const timeoutIds: ReturnType<typeof setTimeout>[] = [];

    const tryPlayImmediate = () => {
      if (isPausedRef.current) return;
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

    const hlsUrl =
      process.env.NEXT_PUBLIC_BG_HLS_URL ||
      "https://4glkq64bdlmmple5.public.blob.vercel-storage.com/hls/background/master.m3u8";
    const fallbackMp4Url =
      process.env.NEXT_PUBLIC_BG_MP4_URL ||
      "https://4glkq64bdlmmple5.public.blob.vercel-storage.com/videos/background.mp4";
    const fallbackWebmUrl =
      process.env.NEXT_PUBLIC_BG_WEBM_URL ||
      "https://4glkq64bdlmmple5.public.blob.vercel-storage.com/videos/background.webm";
    const fallbackUrl =
      (fallbackWebmUrl && video.canPlayType("video/webm")) ? fallbackWebmUrl :
      (fallbackMp4Url && video.canPlayType("video/mp4")) ? fallbackMp4Url :
      null;

    const cleanupHls = () => {
      const conn = (navigator as any).connection;
      if (conn && connectionChangeHandler && typeof conn.removeEventListener === "function") {
        conn.removeEventListener("change", connectionChangeHandler);
        connectionChangeHandler = null;
      }
      if (hls) {
        try {
          hls.destroy();
          hls = null;
        } catch {}
      }
      HlsClass = null;
    };

    const switchToFallback = (reason: string) => {
      if (!fallbackUrl || fallbackUsed) return;
      fallbackUsed = true;
      log("switching to fallback", reason);
      cleanupHls();
      hasSource = true;
      try {
        video.src = fallbackUrl;
        video.preload = "auto";
        video.load();
      } catch {}
      tryPlayImmediate();
    };

    const recoverPlayback = (reason: string) => {
      if (!mounted || isPausedRef.current || fallbackUsed) return;
      stallCount += 1;
      if (fallbackUrl && stallCount >= 3) {
        switchToFallback(`stall-${reason}`);
        return;
      }
      try {
        if (hls && HlsClass) {
          if (stallCount % 2 === 0) {
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
      } catch {}
      tryPlayImmediate();
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

      // Dynamic import HLS.js to reduce initial bundle (~80KB)
      import("hls.js").then((HlsModule) => {
        if (!mounted) return;
        HlsClass = HlsModule.default;

        if (HlsClass.isSupported()) {
          hls = new HlsClass({
            enableWorker: true,
            lowLatencyMode: false,
            capLevelToPlayerSize: true,
            maxDevicePixelRatio: 1,
            startLevel: 0,
            startFragPrefetch: true,
            backBufferLength: 1,
            maxBufferLength: 30,
            maxMaxBufferLength: 60,
            maxBufferSize: 30 * 1000 * 1000,
            maxBufferHole: 0.5,
            abrBandWidthFactor: 0.7,
            abrBandWidthUpFactor: 0.6,
            fragLoadingTimeOut: 10000,
            fragLoadingMaxRetry: 5,
            fragLoadingRetryDelay: 1000,
            fragLoadingMaxRetryTimeout: 8000,
            manifestLoadingMaxRetry: 5,
            manifestLoadingRetryDelay: 1000,
            manifestLoadingMaxRetryTimeout: 8000,
            nudgeOffset: 0.1,
            nudgeMaxRetry: 5,
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

            let maxHeight = 540;
            if (saveData) {
              maxHeight = 360;
            } else if (downlink !== null) {
              if (downlink <= 1.5) maxHeight = 360;
              else if (downlink <= 3) maxHeight = 540;
              else maxHeight = 540;
            } else if (isLowPower) {
              maxHeight = 360;
            }

            const limit = Math.min(maxHeight, vw);
            let bestLevel = 0;
            let bestHeight = 0;
            (hls.levels || []).forEach((level: any, idx: number) => {
              const height = level?.height ?? 0;
              if (height > 0 && height <= limit && height >= bestHeight) {
                bestHeight = height;
                bestLevel = idx;
              }
            });
            hls.autoLevelCapping = bestLevel;
            hls.nextLevel = bestLevel;
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
              recoverPlayback("buffer-stalled");
              return;
            }

            if (!data?.fatal) {
              log('HLS non-fatal error', data);
              return;
            }

            logError('HLS fatal error', data);
            hlsFatalCount += 1;
            if (fallbackUrl && hlsFatalCount >= 2) {
              switchToFallback("fatal-error");
              return;
            }
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
        } else if (fallbackUrl) {
          switchToFallback("no-hls-support");
        }

        if (hasSource) {
          video.preload = "auto";
          video.load();
        }
      }).catch((err) => {
        logError('Failed to load HLS.js', err);
        if (fallbackUrl) {
          switchToFallback("hls-import-failed");
        }
      });

    } catch {
      // ignore
    }

    const onPlaying = () => {
      isPlayingRef.current = true;
      setIsPlaying(true);
      lastAdvance = performance.now();
      stallCount = 0;
    };
    const onPause = () => {
      isPlayingRef.current = false;
      setIsPlaying(false);
      if (!isPausedRef.current) {
        const id = setTimeout(() => {
          if (mounted && !isPausedRef.current) tryPlayImmediate();
        }, 200);
        timeoutIds.push(id);
      }
    };
    const onCanPlay = () => {
      stallCount = 0;
      tryPlayImmediate();
    };
    const onCanPlayThrough = () => {
      stallCount = 0;
      tryPlayImmediate();
    };
    const onWaiting = () => {
      const id = setTimeout(() => {
        if (mounted && !isPausedRef.current) recoverPlayback("waiting");
      }, 350);
      timeoutIds.push(id);
    };
    const onStalled = () => {
      const id = setTimeout(() => {
        if (mounted && !isPausedRef.current) recoverPlayback("stalled");
      }, 450);
      timeoutIds.push(id);
    };
    const onTimeUpdate = () => {
      if (video.currentTime !== lastTime) {
        lastTime = video.currentTime;
        lastAdvance = performance.now();
        stallCount = 0;
      }
    };

    video.addEventListener("playing", onPlaying, { passive: true });
    video.addEventListener("pause", onPause, { passive: true });
    video.addEventListener("canplay", onCanPlay, { passive: true });
    video.addEventListener("canplaythrough", onCanPlayThrough, { passive: true });
    video.addEventListener("waiting", onWaiting, { passive: true });
    video.addEventListener("stalled", onStalled, { passive: true });
    video.addEventListener("timeupdate", onTimeUpdate, { passive: true });
    const onPlay = () => {
      if (isPausedRef.current) {
        video.pause();
      }
    };
    const onEnded = () => {
      if (isPausedRef.current) return;
      try {
        hls?.startLoad(0);
      } catch {}
      try {
        video.currentTime = 0;
      } catch {}
      tryPlayImmediate();
    };
    const onVisibilityChange = () => {
      if (!document.hidden && !isPausedRef.current) {
        tryPlayImmediate();
      }
    };
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
    video.addEventListener("play", onPlay);
    video.addEventListener("ended", onEnded);
    document.addEventListener("visibilitychange", onVisibilityChange);

    // Watchdog interval optimized for smooth performance
    const watchdogId = window.setInterval(() => {
      if (document.hidden) return;
      if (isPausedRef.current) return;
      if (video.paused) {
        tryPlayImmediate();
        return;
      }
      if (video.seeking || !isPlayingRef.current) return;
      const sinceAdvance = performance.now() - lastAdvance;
      if (sinceAdvance < 3500) return;
      const now = performance.now();
      if (now - lastRecoverAt < 2500) return;
      lastRecoverAt = now;
      recoverPlayback("watchdog");
    }, 3500);

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
      video.removeEventListener("play", onPlay);
      video.removeEventListener("ended", onEnded);
      document.removeEventListener("visibilitychange", onVisibilityChange);

      // Clear watchdog interval
      if (watchdogId) window.clearInterval(watchdogId);

      cleanupHls();
    };
  }, [shouldLoadSrc]);

  const togglePause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPausedRef.current) {
      // Resume playback
      isPausedRef.current = false;
      setIsPaused(false);

      const savedTime = pausedTimeRef.current;

      // First restore the time position, then play
      if (savedTime !== null && Number.isFinite(savedTime)) {
        try {
          const targetTime = Number.isFinite(video.duration) && video.duration > 0
            ? Math.min(savedTime, Math.max(0, video.duration - 0.05))
            : Math.max(0, savedTime);
          video.currentTime = targetTime;
        } catch {}
      }

      video.play().then(() => {
        // After play succeeds, verify position is correct
        if (savedTime !== null && Number.isFinite(savedTime)) {
          const targetTime = Number.isFinite(video.duration) && video.duration > 0
            ? Math.min(savedTime, Math.max(0, video.duration - 0.05))
            : Math.max(0, savedTime);
          // If position drifted too far, correct it
          if (Math.abs(video.currentTime - targetTime) > 1) {
            try {
              video.currentTime = targetTime;
            } catch {}
          }
        }
      }).catch(() => {});
    } else {
      // Pause playback
      isPausedRef.current = true;
      setIsPaused(true);
      pausedTimeRef.current = Number.isFinite(video.currentTime) ? video.currentTime : null;
      video.pause();
    }
  };

  return (
    <>
      <video
        ref={videoRef}
        className={`bg-video ${isPlaying || isPaused ? "is-visible" : ""}`}
        autoPlay
        preload="auto"
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
        <span className="bg-video-toggle-label">
          {t("Blocca video di sfondo", "Block background video")}
        </span>
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
