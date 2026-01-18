"use client";

import { useEffect, useRef } from "react";
import type { RefObject } from "react";

export default function useResumeVideoOnVisibility(
  videoRef: RefObject<HTMLVideoElement | null>
) {
  const shouldResumeRef = useRef(false);
  const hiddenAtRef = useRef<number | null>(null);
  const hiddenTimeRef = useRef<number | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    shouldResumeRef.current = !video.paused && !video.ended;

    const handlePlay = () => {
      shouldResumeRef.current = true;
    };

    const handlePause = () => {
      if (document.hidden) return;
      shouldResumeRef.current = false;
    };

    const handleEnded = () => {
      shouldResumeRef.current = false;
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (shouldResumeRef.current && !video.paused) {
          hiddenAtRef.current = performance.now();
          hiddenTimeRef.current = video.currentTime;
        } else {
          hiddenAtRef.current = null;
          hiddenTimeRef.current = null;
        }
        return;
      }

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
    };
  }, [videoRef]);
}
