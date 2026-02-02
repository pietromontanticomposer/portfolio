"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import CaseStudyVideo from "./CaseStudyVideo";
import KeepPlayingVideo from "./KeepPlayingVideo";
import { useLanguage } from "../lib/LanguageContext";
import { getMediaSources } from "../lib/mediaUtils";

type ShowreelSectionProps = {
  embedUrl?: string | null;
};

export default function ShowreelSection({ embedUrl }: ShowreelSectionProps) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window === "undefined") return false;
    let shouldOpen = false;
    try {
      if (window.sessionStorage.getItem("openShowreel") === "1") {
        window.sessionStorage.removeItem("openShowreel");
        shouldOpen = true;
      }
    } catch {
      // ignore storage errors
    }
    if (!shouldOpen && window.location.hash === "#showreel") {
      shouldOpen = true;
    }
    return shouldOpen;
  });
  const portalTarget =
    typeof document === "undefined" ? null : document.body;
  const coverRef = useRef<HTMLDivElement>(null);
  const coverTimeoutRef = useRef<number | null>(null);
  const showreelLabel = t("Showreel", "Showreel");
  const { isHls, isMp4, src, mp4Fallback } = getMediaSources(embedUrl ?? undefined);
  const hasEmbed = !!src;
  const showreelPoster =
    "https://ui0he7mtsmc0vwcb.public.blob.vercel-storage.com/uploads/video/Showreel%20Sito.jpg";
  const showreelPosterAlt = t("Showreel", "Showreel");

  const hideCover = useCallback(() => {
    if (coverTimeoutRef.current) {
      window.clearTimeout(coverTimeoutRef.current);
      coverTimeoutRef.current = null;
    }
    coverRef.current?.classList.remove("is-active");
  }, []);

  const showCover = useCallback(() => {
    const cover = coverRef.current;
    if (!cover) return;
    cover.classList.add("is-active");
    if (coverTimeoutRef.current) {
      window.clearTimeout(coverTimeoutRef.current);
    }
    coverTimeoutRef.current = window.setTimeout(() => {
      cover.classList.remove("is-active");
      coverTimeoutRef.current = null;
    }, 1200);
  }, []);

  const armCover = useCallback(() => {
    requestAnimationFrame(() => {
      showCover();
    });
  }, [showCover]);

  const openModal = useCallback(() => {
    setIsOpen(true);
    armCover();
  }, [armCover]);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  useEffect(() => {
    const handleOpen = () => {
      setIsOpen(true);
      armCover();
    };
    window.addEventListener("showreel:open", handleOpen);
    return () => {
      window.removeEventListener("showreel:open", handleOpen);
    };
  }, [armCover]);

  useEffect(() => {
    if (!isOpen) return;
    armCover();
  }, [armCover, isOpen]);


  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeModal();
    };
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("keydown", handleKey);
    };
  }, [closeModal, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    document.body.classList.add("showreel-open");
    return () => {
      document.body.classList.remove("showreel-open");
    };
  }, [isOpen]);

  const autoplayEmbedUrl = useMemo(() => {
    if (!src || isHls || isMp4) return src;
    try {
      const url = new URL(src);
      url.searchParams.set("autoplay", "1");
      url.searchParams.set("muted", "0");
      url.searchParams.set("playsinline", "1");
      return url.toString();
    } catch {
      return src;
    }
  }, [isHls, isMp4, src]);

  const modalContent = isOpen ? (
    <div className="modal-overlay showreel-modal-overlay" role="dialog" aria-modal="true" aria-label={showreelLabel} onClick={closeModal}>
      <div className="modal-panel showreel-modal-panel" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">{showreelLabel}</div>
          <button type="button" className="modal-close" onClick={closeModal}>
            {t("Chiudi", "Close")}
          </button>
        </div>
        <div className="showreel-modal-body">
          {hasEmbed ? (
            <div className="video-wrapper">
              {isHls ? (
                <CaseStudyVideo
                  hlsUrl={src ?? ""}
                  mp4Url={mp4Fallback}
                  title={showreelLabel}
                  poster={showreelPoster}
                  autoPlay
                  onFirstFrame={hideCover}
                />
              ) : isMp4 ? (
                <KeepPlayingVideo
                  className="case-study-video absolute inset-0 h-full w-full rounded-xl"
                  controls
                  playsInline
                  autoPlay
                  preload="auto"
                  poster={showreelPoster}
                  aria-label={t("Video showreel", "Showreel video")}
                  onFirstFrame={hideCover}
                >
                  <source src={encodeURI(src ?? "")} type="video/mp4" />
                  {t("Il tuo browser non supporta il tag video.", "Your browser does not support the video tag.")}
                </KeepPlayingVideo>
              ) : (
                <iframe
                  src={encodeURI(autoplayEmbedUrl ?? "")}
                  title={showreelLabel}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
              <div
                ref={coverRef}
                className="showreel-start-cover"
                style={{ backgroundImage: `url(${showreelPoster})` }}
                aria-hidden="true"
              />
            </div>
          ) : (
            <div className="text-sm text-[color:var(--muted)]">
              {t(
                "Showreel disponibile su richiesta. Contattami per ricevere il link.",
                "Showreel available on request. Contact me for the private link."
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  ) : null;

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
            <button
              type="button"
              onClick={openModal}
              className="group absolute inset-0 overflow-hidden rounded-xl border border-[color:var(--card-border)] bg-[color:var(--card-inset-bg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)]"
              aria-label={t("Apri showreel", "Open showreel")}
            >
              <Image
                src={showreelPoster}
                alt={showreelPosterAlt}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-[1.01]"
                sizes="(max-width: 768px) 100vw, 1100px"
                priority
              />
              <div className="card-overlay absolute inset-0" aria-hidden="true" />
              <div className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
                <div className="case-study-play-button flex h-14 w-14 items-center justify-center rounded-full">
                  <svg className="h-6 w-6 text-white" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M5 3.5v9l7-4.5-7-4.5z" />
                  </svg>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {portalTarget && modalContent ? createPortal(modalContent, portalTarget) : null}
    </section>
  );
}
