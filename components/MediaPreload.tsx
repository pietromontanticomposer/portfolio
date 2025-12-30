"use client";

import { useEffect, useRef } from "react";

type Props = {
  images: string[];
};

export default function MediaPreload({ images }: Props) {
  const cacheRef = useRef<HTMLImageElement[]>([]);

  useEffect(() => {
    const unique = Array.from(new Set(images.filter(Boolean)));
    const cache: HTMLImageElement[] = [];
    let cancelled = false;

    const conn = typeof navigator !== "undefined" ? (navigator as any).connection : null;
    const saveData = !!conn?.saveData;
    const effectiveType = typeof conn?.effectiveType === "string" ? conn.effectiveType : "";
    const lowNet = /2g/.test(effectiveType);
    const deviceMemory = typeof (navigator as any)?.deviceMemory === "number" ? (navigator as any).deviceMemory : 8;
    const cores = typeof navigator?.hardwareConcurrency === "number" ? navigator.hardwareConcurrency : 8;

    const eagerCount = saveData ? 0 : (deviceMemory <= 4 || cores <= 4 || lowNet ? 4 : 8);
    const eagerList = unique.slice(0, eagerCount);
    const deferredList = unique.slice(eagerCount);

    const createScheduler = (list: string[], batchSize: number) => {
      let idx = 0;
      const loadBatch = (deadline?: IdleDeadline) => {
        if (cancelled) return false;
        let count = 0;
        while (idx < list.length) {
          if (deadline && deadline.timeRemaining() < 5) break;
          const src = list[idx++];
          const img = new Image();
          img.decoding = "async";
          img.loading = "eager";
          img.src = src;
          cache.push(img);
          count += 1;
          if (!deadline && count >= batchSize) break;
        }
        if (idx < list.length) return true;
        cacheRef.current = cache;
        return false;
      };

      const schedule = () => {
        if ("requestIdleCallback" in window) {
          (window as any).requestIdleCallback((deadline: IdleDeadline) => {
            const hasMore = loadBatch(deadline);
            if (hasMore) schedule();
          }, { timeout: 1500 });
        } else {
          setTimeout(() => {
            const hasMore = loadBatch();
            if (hasMore) schedule();
          }, 200);
        }
      };

      return schedule;
    };

    const scheduleEager = eagerList.length ? createScheduler(eagerList, 4) : null;
    if (scheduleEager) scheduleEager();

    let deferredStarted = false;
    const scheduleDeferred = deferredList.length ? createScheduler(deferredList, 2) : null;
    const startDeferred = () => {
      if (deferredStarted || !scheduleDeferred) return;
      deferredStarted = true;
      scheduleDeferred();
    };

    const onFirstInteraction = () => startDeferred();
    window.addEventListener("scroll", onFirstInteraction, { passive: true, once: true });
    window.addEventListener("pointerdown", onFirstInteraction, { once: true });
    window.addEventListener("keydown", onFirstInteraction, { once: true });
    const fallbackTimer = window.setTimeout(startDeferred, 4000);

    return () => {
      cancelled = true;
      window.removeEventListener("scroll", onFirstInteraction);
      window.removeEventListener("pointerdown", onFirstInteraction);
      window.removeEventListener("keydown", onFirstInteraction);
      window.clearTimeout(fallbackTimer);
    };
  }, [images]);

  return null;
}
