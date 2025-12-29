/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";

export default function BackgroundVideo() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [shouldLoadSrc, setShouldLoadSrc] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const hasLoadedRef = useRef(false);

  // Load when visible; keep only user agent preferences as opt-outs.
  useEffect(() => {
    const prefersReducedMotion =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData = (navigator as any).connection?.saveData;

    if (prefersReducedMotion || saveData) return;
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;
    const node = videoRef.current;
    if (!node || !("IntersectionObserver" in window)) {
      setShouldLoadSrc(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldLoadSrc(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Attach sources and attempt playback
  useEffect(() => {
    if (!shouldLoadSrc || !videoRef.current) return;
    const video = videoRef.current;

    // Diagnostic logging to help debug playback issues
    const log = (...args: any[]) => {
      try {
        // eslint-disable-next-line no-console
        console.debug('[BackgroundVideo]', ...args);
      } catch {}
    };

    const logError = (...args: any[]) => {
      try {
        // eslint-disable-next-line no-console
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

    let hls: Hls | null = null;
    let connectionChangeHandler: (() => void) | null = null;
    let lastTime = 0;
    let lastAdvance = performance.now();
    let lastRecoverAt = 0;
    let stallCount = 0;
    let hasSource = false;

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

      if (Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: false,
          capLevelToPlayerSize: true,
          startLevel: 0,
          backBufferLength: 2,
          maxBufferLength: 5,
          maxMaxBufferLength: 10,
          maxBufferSize: 6 * 1000 * 1000,
          maxBufferHole: 0.5,
          abrBandWidthFactor: 0.65,
          abrBandWidthUpFactor: 0.55,
          fragLoadingTimeOut: 10000,
          fragLoadingMaxRetry: 6,
          fragLoadingRetryDelay: 800,
          fragLoadingMaxRetryTimeout: 8000,
          manifestLoadingMaxRetry: 6,
          manifestLoadingRetryDelay: 800,
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
            (l) => (l?.height ?? 0) > 0 && (l?.height ?? 0) <= limit
          );
          if (typeof level === "number" && level >= 0) {
            hls.autoLevelCapping = level;
          }
        };

        hls.on(Hls.Events.MANIFEST_PARSED, chooseCapLevel);
        hls.on(Hls.Events.MEDIA_ATTACHED, () => log('HLS MEDIA_ATTACHED'));
        hls.on(Hls.Events.BUFFER_APPENDED, () => log('HLS BUFFER_APPENDED'));
        const conn = (navigator as any).connection;
        if (conn && typeof conn.addEventListener === "function") {
          connectionChangeHandler = chooseCapLevel;
          conn.addEventListener("change", connectionChangeHandler);
        }

        hls.on(Hls.Events.ERROR, (_event, data) => {
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

          if (data?.details === Hls.ErrorDetails.BUFFER_STALLED_ERROR) {
            hls?.startLoad();
            tryPlayImmediate();
            return;
          }

          if (!data?.fatal) {
            log('HLS non-fatal error', data);
            return;
          }

          logError('HLS fatal error', data);
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            hls?.startLoad();
          } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            hls?.recoverMediaError();
          } else {
            try {
              hls?.destroy();
            } catch (e) {
              logError('Error destroying HLS instance', e);
            }
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        // Safari: native HLS
        try {
          video.src = hlsUrl;
          hasSource = true;
        } catch {}
      } else {
        // fallback - do not force MP4 here; let HLS or the browser decide
      }

      if (hasSource) {
        video.preload = "metadata";
        video.load();
      }
    } catch {
      // ignore
    }

    const tryPlayImmediate = () => {
      if (!hasSource) return;
      try {
        video.muted = true;
      } catch {}
      const p = video.play();
      if (p && typeof (p as Promise<void>).then === "function") {
        (p as Promise<void>)
          .then(() => log('video.play() succeeded'))
          .catch((err) => {
            if (err?.name === "NotSupportedError") return;
            logError('video.play() rejected', err, { paused: video.paused, readyState: video.readyState, networkState: video.networkState });
          });
      }
    };

    const onPlaying = () => {
      setIsPlaying(true);
      lastAdvance = performance.now();
    };
    const onPause = () => setIsPlaying(false);
    const onCanPlay = () => tryPlayImmediate();
    const onCanPlayThrough = () => tryPlayImmediate();
    const onWaiting = () => setTimeout(() => tryPlayImmediate(), 250);
    const onStalled = () => setTimeout(() => tryPlayImmediate(), 500);
    const onTimeUpdate = () => {
      if (video.currentTime !== lastTime) {
        lastTime = video.currentTime;
        lastAdvance = performance.now();
      }
    };

    video.addEventListener("playing", onPlaying);
    video.addEventListener("pause", onPause);
    video.addEventListener("canplay", onCanPlay);
    video.addEventListener("canplaythrough", onCanPlayThrough);
    video.addEventListener("waiting", onWaiting);
    video.addEventListener("stalled", onStalled);
    video.addEventListener("timeupdate", onTimeUpdate);
    const onError = (e: Event) => {
      try {
        const mediaError = video.error;
        const errorInfo = mediaError
          ? { code: mediaError.code, message: mediaError.message }
          : null;
        if (mediaError?.code === 4) return;
        // eslint-disable-next-line no-console
        console.error('[BackgroundVideo] video element error', e, {
          readyState: video.readyState,
          networkState: video.networkState,
          error: errorInfo,
        });
      } catch {}
    };
    video.addEventListener("error", onError);

    tryPlayImmediate();
    requestAnimationFrame(() => {
      tryPlayImmediate();
      if ("requestIdleCallback" in window) {
        (window as any).requestIdleCallback(() => tryPlayImmediate(), {
          timeout: 800,
        });
      } else {
        setTimeout(() => tryPlayImmediate(), 500);
      }
    });

    const watchdogId = window.setInterval(() => {
      if (document.hidden) return;
      if (video.paused || video.seeking || !isPlaying) return;
      const sinceAdvance = performance.now() - lastAdvance;
      if (sinceAdvance < 4000) return;
      const now = performance.now();
      if (now - lastRecoverAt < 3000) return;
      lastRecoverAt = now;
      stallCount += 1;
      try {
        if (hls) {
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
    }, 4000);

    return () => {
      video.removeEventListener("playing", onPlaying);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("canplay", onCanPlay);
      video.removeEventListener("canplaythrough", onCanPlayThrough);
      video.removeEventListener("waiting", onWaiting);
      video.removeEventListener("stalled", onStalled);
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("error", onError);
      if (watchdogId) window.clearInterval(watchdogId);
      const conn = (navigator as any).connection;
      if (conn && connectionChangeHandler && typeof conn.removeEventListener === "function") {
        conn.removeEventListener("change", connectionChangeHandler);
      }
      if (hls) {
        try {
          hls.destroy();
        } catch {}
      }
    };
  }, [shouldLoadSrc]);

  // Render only poster when reduced-motion or save-data is requested
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const saveData =
    typeof navigator !== "undefined" && (navigator as any).connection?.saveData;

  if (prefersReducedMotion || saveData) {
    return (
      <>
        <div
          className={`bg-video-poster`}
          style={{ backgroundImage: `url('https://4glkq64bdlmmple5.public.blob.vercel-storage.com/background-poster.jpg')` }}
          aria-hidden="true"
        />
        <div className="bg-video-overlay" aria-hidden="true" />
      </>
    );
  }

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
        style={{ transform: "translateZ(0)" }}
      />

      <div
        className={`bg-video-poster ${isPlaying ? "is-hidden" : ""}`}
        style={{ backgroundImage: `url('https://4glkq64bdlmmple5.public.blob.vercel-storage.com/background-poster.jpg')` }}
        aria-hidden="true"
      />

      <div className="bg-video-overlay" aria-hidden="true" />
    </>
  );
}
