"use client";

import { useEffect, useRef } from "react";
import type { RefObject } from "react";

type UseResumeVideoOnVisibilityOptions = {
  keepPlayingWhenHidden?: boolean;
};

export default function useResumeVideoOnVisibility(
  videoRef: RefObject<HTMLVideoElement | null>,
  { keepPlayingWhenHidden = false }: UseResumeVideoOnVisibilityOptions = {}
) {
  const shouldResumeRef = useRef(false);
  const hiddenAtRef = useRef<number | null>(null);
  const hiddenTimeRef = useRef<number | null>(null);
  const hiddenRetryIdRef = useRef<number | null>(null);
  const hiddenRetryCountRef = useRef(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    shouldResumeRef.current = !video.paused && !video.ended;

    const clearHiddenRetry = () => {
      if (hiddenRetryIdRef.current !== null) {
        window.clearTimeout(hiddenRetryIdRef.current);
        hiddenRetryIdRef.current = null;
      }
      hiddenRetryCountRef.current = 0;
    };

    const scheduleHiddenRetry = () => {
      if (!keepPlayingWhenHidden) return;
      if (!document.hidden) return;
      if (!shouldResumeRef.current) return;
      if (hiddenRetryIdRef.current !== null) return;

      // Keep retrying indefinitely while hidden (every 2 seconds)
      const delay = 2000;
      hiddenRetryIdRef.current = window.setTimeout(() => {
        hiddenRetryIdRef.current = null;
        if (!document.hidden || !shouldResumeRef.current) {
          clearHiddenRetry();
          return;
        }
        hiddenRetryCountRef.current += 1;
        video.play().catch(() => {});
        scheduleHiddenRetry();
      }, delay);
    };

    const handlePlay = () => {
      shouldResumeRef.current = true;
      clearHiddenRetry();
    };

    const handlePause = () => {
      if (document.hidden) {
        if (shouldResumeRef.current && hiddenAtRef.current === null) {
          hiddenAtRef.current = performance.now();
          hiddenTimeRef.current = video.currentTime;
        }
        scheduleHiddenRetry();
        return;
      }
      shouldResumeRef.current = false;
      hiddenAtRef.current = null;
      hiddenTimeRef.current = null;
      clearHiddenRetry();
    };

    const handleEnded = () => {
      shouldResumeRef.current = false;
      hiddenAtRef.current = null;
      hiddenTimeRef.current = null;
      clearHiddenRetry();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (shouldResumeRef.current) {
          hiddenAtRef.current = performance.now();
          hiddenTimeRef.current = video.currentTime;
          scheduleHiddenRetry();
        } else {
          hiddenAtRef.current = null;
          hiddenTimeRef.current = null;
          clearHiddenRetry();
        }
        return;
      }

      clearHiddenRetry();

      if (!shouldResumeRef.current) {
        hiddenAtRef.current = null;
        hiddenTimeRef.current = null;
        return;
      }

      if (video.ended) {
        shouldResumeRef.current = false;
        hiddenAtRef.current = null;
        hiddenTimeRef.current = null;
        return;
      }

      if (video.paused && hiddenAtRef.current !== null && hiddenTimeRef.current !== null) {
        const elapsed = (performance.now() - hiddenAtRef.current) / 1000;
        if (Number.isFinite(elapsed) && elapsed > 0) {
          const targetTime = hiddenTimeRef.current + elapsed;
          try {
            if (Number.isFinite(video.duration) && video.duration > 0) {
              const maxTime = Math.max(0, video.duration - 0.05);
              const nextTime = video.loop ? targetTime % video.duration : targetTime;
              video.currentTime = Math.min(maxTime, Math.max(0, nextTime));
            } else if (Number.isFinite(targetTime)) {
              video.currentTime = Math.max(0, targetTime);
            }
          } catch {}
        }
      }

      hiddenAtRef.current = null;
      hiddenTimeRef.current = null;

      if (video.paused) {
        video.play().catch(() => {});
      }
    };

    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("ended", handleEnded);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("ended", handleEnded);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearHiddenRetry();
    };
  }, [videoRef, keepPlayingWhenHidden]);
}
