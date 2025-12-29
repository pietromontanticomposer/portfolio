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
    let index = 0;
    let cancelled = false;

    const loadBatch = (deadline?: IdleDeadline) => {
      if (cancelled) return;
      let count = 0;
      while (index < unique.length) {
        if (deadline && deadline.timeRemaining() < 5) break;
        const src = unique[index++];
        const img = new Image();
        img.decoding = "async";
        img.loading = "eager";
        img.src = src;
        cache.push(img);
        count += 1;
        if (!deadline && count >= 4) break;
      }
      if (index < unique.length) {
        schedule();
      } else {
        cacheRef.current = cache;
      }
    };

    const schedule = () => {
      if ("requestIdleCallback" in window) {
        (window as any).requestIdleCallback(loadBatch, { timeout: 1500 });
      } else {
        setTimeout(() => loadBatch(), 200);
      }
    };

    schedule();
    return () => {
      cancelled = true;
    };
  }, [images]);

  return null;
}
