"use client";

import { memo, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useLanguage } from "../lib/LanguageContext";

function ShowreelLoading() {
  const { t } = useLanguage();
  const showreelLabel = t("Showreel", "Showreel");

  return (
    <section id="showreel" className="w-full">
      <div className="card-shell p-6 sm:p-8">
        <div className="section-header flex items-center justify-between">
          <h3 className="section-title text-2xl text-[color:var(--foreground)]">
            {showreelLabel}
          </h3>
        </div>
        <div className="mt-6">
          <div className="video-wrapper">
            <div className="absolute inset-0 flex items-center justify-center bg-[color:var(--background)]/50 rounded-xl">
              <div className="text-sm text-[color:var(--muted)]">···</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const ShowreelSection = dynamic(() => import("./ShowreelSection"), {
  loading: ShowreelLoading,
  ssr: false,
});

type LazyShowreelProps = {
  embedUrl?: string | null;
};

function LazyShowreel({ embedUrl }: LazyShowreelProps) {
  const [shouldLoad, setShouldLoad] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();
  const showreelLabel = t("Showreel", "Showreel");

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldLoad(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: "100px" }
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={containerRef}>
      {shouldLoad ? (
        <ShowreelSection embedUrl={embedUrl} />
      ) : (
        <section id="showreel" className="w-full">
          <div className="card-shell p-6 sm:p-8">
            <div className="section-header flex items-center justify-between">
              <h3 className="section-title text-2xl text-[color:var(--foreground)]">
                {showreelLabel}
              </h3>
            </div>
            <div className="mt-6">
              <div className="video-wrapper" style={{ minHeight: "400px" }}>
                <div className="absolute inset-0 flex items-center justify-center bg-[color:var(--card)]/50 rounded-xl">
                  <div className="text-sm text-[color:var(--muted)]">{t("Scorri per caricare il video", "Scroll to load video")}</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default memo(LazyShowreel);
