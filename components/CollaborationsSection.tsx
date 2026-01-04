"use client";

import Image from "next/image";
import React, { memo, useCallback, useEffect, useRef } from "react";
import { animationCoordinator } from "../lib/AnimationCoordinator";

type Partner = {
  name: string;
  image: string;
};

function CollaborationsSection({ partners }: { partners: Partner[] }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const track = trackRef.current;
    if (!container || !track) return;

    const speed = 60; // px/s
    let isVisible = true;
    let isTabVisible = !document.hidden;
    let isAnimationActive = true;

    const updateWidth = () => {
      const firstSetWidth = Math.max(1, track.scrollWidth / 2);
      const duration = firstSetWidth / speed;
      track.style.setProperty("--scroll-width", `${firstSetWidth}px`);
      track.style.setProperty("--scroll-offset", `${-firstSetWidth}px`);
      track.style.setProperty("--scroll-duration", `${duration}s`);
    };

    const applyAnimationState = () => {
      const shouldRun = isVisible && isTabVisible && isAnimationActive;
      track.setAttribute("data-auto-scroll", "true");
      track.style.animationPlayState = shouldRun ? "running" : "paused";
    };

    const imgNodes = Array.from(track.querySelectorAll("img"));
    imgNodes.forEach((img) => {
      if (!img.complete) img.addEventListener("load", updateWidth, { once: true });
    });

    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(updateWidth, 100);
    };

    window.addEventListener("resize", handleResize, { passive: true } as AddEventListenerOptions);
    requestAnimationFrame(updateWidth);

    const visibilityObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting;
          applyAnimationState();
        });
      },
      { threshold: 0.01 }
    );
    visibilityObserver.observe(container);

    const handleVisibilityChange = () => {
      isTabVisible = !document.hidden;
      applyAnimationState();
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const unsubscribe = animationCoordinator.subscribe((state) => {
      isAnimationActive = state === "active";
      applyAnimationState();
    });

    applyAnimationState();

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimeout);
      visibilityObserver.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      unsubscribe();
      track.removeAttribute("data-auto-scroll");
      track.style.animationPlayState = "";
      track.style.transform = "";
      track.style.removeProperty("--scroll-width");
      track.style.removeProperty("--scroll-offset");
      track.style.removeProperty("--scroll-duration");
    };
  }, [partners]);

  const renderItems = useCallback(
    (items: Partner[]) =>
      items.map((p, idx) => (
        <div key={`${p.name}-${idx}`} className="flex items-center justify-center mx-6" style={{ width: "120px", height: "60px" }}>
          <Image
            src={p.image}
            alt={p.name}
            width={120}
            height={60}
            className="object-contain max-h-full opacity-70 hover:opacity-100 transition-opacity"
            sizes="120px"
            loading="lazy"
            decoding="async"
          />
        </div>
      )),
    []
  );

  return (
    <section className="card-shell p-6 sm:p-8">
      <div className="section-header flex items-center justify-between">
        <h3 className="section-title text-2xl text-[color:var(--foreground)]">
          Collaborations
        </h3>
      </div>
      <div className="scroll-strip mt-6 flex items-center" ref={containerRef}>
        <div className="scroll-track flex items-center" ref={trackRef}>
          {renderItems(partners)}
          {renderItems(partners)}
        </div>
      </div>
    </section>
  );
}

export default memo(CollaborationsSection);
