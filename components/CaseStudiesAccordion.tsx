"use client";

import { useEffect, useRef } from "react";

type CaseStudiesAccordionProps = {
  className?: string;
  children: React.ReactNode;
};

export default function CaseStudiesAccordion({
  className,
  children,
}: CaseStudiesAccordionProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const pauseVideos = (detail: HTMLElement) => {
      const videos = detail.querySelectorAll<HTMLVideoElement>("video");
      videos.forEach((video) => {
        if (!video.paused) {
          video.pause();
        }
      });
    };

    const closeDetail = (detail: HTMLDetailsElement) => {
      pauseVideos(detail);
      detail.removeAttribute("open");
    };

    const openOnLoad = container.querySelectorAll<HTMLDetailsElement>(
      "details.case-study-card[open]"
    );
    openOnLoad.forEach((detail) => closeDetail(detail));

    const onToggle = (event: Event) => {
      const target = event.target as HTMLDetailsElement | null;
      if (!target || target.tagName !== "DETAILS") return;
      if (!target.classList.contains("case-study-card")) return;

      if (!target.open) {
        pauseVideos(target);
        return;
      }

      const openDetails = container.querySelectorAll<HTMLDetailsElement>(
        "details.case-study-card[open]"
      );
      openDetails.forEach((detail) => {
        if (detail !== target) closeDetail(detail);
      });
    };

    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const summary = target?.closest("summary");
      if (!summary) return;
      const detail = summary.parentElement as HTMLDetailsElement | null;
      if (!detail || detail.tagName !== "DETAILS") return;
      if (!detail.classList.contains("case-study-card")) return;
      const openDetails = container.querySelectorAll<HTMLDetailsElement>(
        "details.case-study-card[open]"
      );
      openDetails.forEach((openDetail) => {
        if (openDetail !== detail) closeDetail(openDetail);
      });
    };

    container.addEventListener("toggle", onToggle);
    container.addEventListener("click", onClick);
    return () => {
      container.removeEventListener("toggle", onToggle);
      container.removeEventListener("click", onClick);
    };
  }, []);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}
