"use client";

import { useEffect, useRef } from "react";
import type Hls from "hls.js";
import { useLanguage } from "../lib/LanguageContext";
import useResumeVideoOnVisibility from "./useResumeVideoOnVisibility";

type CaseStudyVideoProps = {
  hlsUrl: string;
  mp4Url?: string | null;
  title: string;
  poster?: string | null;
};

export default function CaseStudyVideo({
  hlsUrl,
  mp4Url,
  title,
  poster,
}: CaseStudyVideoProps) {
  const { t } = useLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  useResumeVideoOnVisibility(videoRef, { keepPlayingWhenHidden: true });

  const normalizedHls = hlsUrl?.trim();
  const normalizedMp4 = mp4Url?.trim() ?? null;
  const posterFromMp4 = normalizedMp4 ? normalizedMp4.replace(/\.mp4$/i, ".jpg") : undefined;
  const posterUrl = poster || posterFromMp4;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (!normalizedHls) {
      if (normalizedMp4) {
        video.src = normalizedMp4;
      }
      return;
    }

    video.crossOrigin = "anonymous";
    video.preload = "auto";
    video.muted = false;
    video.volume = 1.0;

    let lastTime = 0;
    let lastAdvance = performance.now();
    let lastRecoverAt = 0;
    let stallCount = 0;
    let fallbackUsed = false;
    let mounted = true;
    const timeoutIds: ReturnType<typeof setTimeout>[] = [];
    let watchdogId: number | null = null;
    let connectionChangeHandler: (() => void) | null = null;

    const handleCanPlay = () => {
      video.muted = false;
      video.volume = 1.0;
    };

    const switchToMp4 = () => {
      if (!normalizedMp4 || fallbackUsed) return;
      fallbackUsed = true;
      try {
        hlsRef.current?.destroy();
        hlsRef.current = null;
      } catch {}
      try {
        video.src = normalizedMp4;
        video.preload = "auto";
        video.load();
      } catch {}
      if (!video.paused) {
        video.play().catch(() => {});
      }
    };

    const recoverPlayback = () => {
      if (!mounted) return;
      if (video.paused || video.ended) return;
      const now = performance.now();
      if (now - lastRecoverAt < 2000) return;
      lastRecoverAt = now;
      stallCount += 1;
      if (normalizedMp4 && stallCount >= 3) {
        switchToMp4();
        return;
      }
      try {
        const hls = hlsRef.current;
        if (hls) {
          if (stallCount >= 2) {
            const currentLevel = hls.currentLevel;
            if (currentLevel > 0) {
              hls.autoLevelCapping = currentLevel - 1;
              hls.nextLevel = currentLevel - 1;
            }
          }
          if (stallCount % 2 === 0) {
            hls.stopLoad();
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
      video.play().catch(() => {});
    };

    const scheduleRecover = (delay = 350) => {
      const id = window.setTimeout(() => recoverPlayback(), delay);
      timeoutIds.push(id);
    };

    const handlePlaying = () => {
      lastAdvance = performance.now();
      stallCount = 0;
    };

    const handleWaiting = () => {
      if (video.paused || video.ended || video.seeking) return;
      scheduleRecover();
    };

    const handleStalled = () => {
      if (video.paused || video.ended || video.seeking) return;
      scheduleRecover(450);
    };

    const handleTimeUpdate = () => {
      if (video.currentTime !== lastTime) {
        lastTime = video.currentTime;
        lastAdvance = performance.now();
        stallCount = 0;
      }
    };

    const handleError = () => {
      if (normalizedMp4) {
        switchToMp4();
      }
    };

    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("playing", handlePlaying);
    video.addEventListener("waiting", handleWaiting);
    video.addEventListener("stalled", handleStalled);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("error", handleError);

    watchdogId = window.setInterval(() => {
      if (!mounted) return;
      if (document.hidden) return;
      if (video.paused || video.ended || video.seeking) return;
      if (performance.now() - lastAdvance < 4500) return;
      recoverPlayback();
    }, 4500);

    // If browser natively supports HLS (Safari)
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = normalizedHls;
      video.preload = "auto";
      video.load();
    } else {
      // Dynamic import hls.js to reduce bundle size (~80KB saved)
      import("hls.js")
        .then((HlsModule) => {
          if (!mounted || !video) return;

          const Hls = HlsModule.default;

          if (!Hls.isSupported()) {
            // Fallback to MP4 if HLS not supported
            if (normalizedMp4) {
              video.src = normalizedMp4;
            }
            return;
          }

          const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: false,
            capLevelToPlayerSize: true,
            maxDevicePixelRatio: 1,
            startLevel: 0,
            startFragPrefetch: true,
            backBufferLength: 60,
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

          hlsRef.current = hls;
          hls.loadSource(normalizedHls);
          hls.attachMedia(video);
          hls.startLoad();

          const chooseCapLevel = () => {
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
              else if (downlink <= 5) maxHeight = 720;
              else maxHeight = 1080;
            } else if (isLowPower) {
              maxHeight = 540;
            }

            const limit = Math.min(maxHeight, vw);
            let bestLevel = 0;
            let bestHeight = 0;
            (hls.levels || []).forEach((level, idx) => {
              const height = level?.height ?? 0;
              if (height > 0 && height <= limit && height >= bestHeight) {
                bestHeight = height;
                bestLevel = idx;
              }
            });
            hls.autoLevelCapping = bestLevel;
            hls.nextLevel = bestLevel;
          };

          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            video.muted = false;
            video.volume = 1.0;
            chooseCapLevel();
          });

          hls.on(Hls.Events.ERROR, (_event: unknown, data: { fatal?: boolean; type?: string; details?: string }) => {
            if (data?.details === Hls.ErrorDetails.BUFFER_STALLED_ERROR || data?.details === Hls.ErrorDetails.BUFFER_NUDGE_ON_STALL) {
              recoverPlayback();
              return;
            }

            if (
              data?.details === Hls.ErrorDetails.FRAG_LOAD_ERROR ||
              data?.details === Hls.ErrorDetails.FRAG_LOAD_TIMEOUT ||
              data?.details === Hls.ErrorDetails.LEVEL_LOAD_ERROR ||
              data?.details === Hls.ErrorDetails.LEVEL_LOAD_TIMEOUT
            ) {
              recoverPlayback();
              return;
            }

            if (!data?.fatal) return;

            const HlsErrorTypes = Hls.ErrorTypes as { NETWORK_ERROR: string; MEDIA_ERROR: string };
            switch (data.type) {
              case HlsErrorTypes.NETWORK_ERROR:
                hls.startLoad();
                break;
              case HlsErrorTypes.MEDIA_ERROR:
                hls.recoverMediaError();
                break;
              default:
                hls.destroy();
                if (normalizedMp4) {
                  video.src = normalizedMp4;
                }
                break;
            }
          });

          const conn = (navigator as any).connection;
          if (conn && typeof conn.addEventListener === "function") {
            connectionChangeHandler = chooseCapLevel;
            conn.addEventListener("change", connectionChangeHandler);
          }
        })
        .catch(() => {
          // Fallback to MP4 if hls.js fails to load
          if (normalizedMp4 && video) {
            video.src = normalizedMp4;
          }
        });
    }

    return () => {
      mounted = false;
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("playing", handlePlaying);
      video.removeEventListener("waiting", handleWaiting);
      video.removeEventListener("stalled", handleStalled);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("error", handleError);
      timeoutIds.forEach((id) => clearTimeout(id));
      timeoutIds.length = 0;
      if (watchdogId !== null) {
        window.clearInterval(watchdogId);
      }
      const conn = (navigator as any).connection;
      if (conn && connectionChangeHandler && typeof conn.removeEventListener === "function") {
        conn.removeEventListener("change", connectionChangeHandler);
        connectionChangeHandler = null;
      }
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [normalizedHls, normalizedMp4]);

  return (
    <video
      ref={videoRef}
      className="case-study-video absolute inset-0 h-full w-full rounded-xl"
      controls
      playsInline
      preload={normalizedHls ? "auto" : "metadata"}
      crossOrigin="anonymous"
      poster={posterUrl}
      src={normalizedHls ? undefined : normalizedMp4 ?? undefined}
      aria-label={title}
    >
      {t("Il tuo browser non supporta il tag video.", "Your browser does not support the video tag.")}
    </video>
  );
}
