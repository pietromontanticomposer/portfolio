"use client";

import CaseStudyVideo from "./CaseStudyVideo";
import { useLanguage } from "../lib/LanguageContext";

const PLACEHOLDER_WEBM =
  "https://4glkq64bdlmmple5.public.blob.vercel-storage.com/videos/background.webm";
const PLACEHOLDER_MP4 =
  "https://4glkq64bdlmmple5.public.blob.vercel-storage.com/videos/background.mp4";

type ShowreelSectionProps = {
  embedUrl?: string | null;
};

export default function ShowreelSection({ embedUrl }: ShowreelSectionProps) {
  const { t } = useLanguage();
  const showreelLabel = t("Showreel", "Showreel");
  const hasEmbed = typeof embedUrl === "string" && embedUrl.trim().length > 0;
  const trimmedUrl = embedUrl?.trim() ?? "";
  const isHls = hasEmbed && (trimmedUrl.endsWith(".m3u8") || trimmedUrl.includes("/_hls/"));
  const isMp4 = hasEmbed && /\.mp4(?:\?|$)/i.test(trimmedUrl);
  const mp4Fallback =
    trimmedUrl.startsWith("/uploads/video/_hls/") && trimmedUrl.endsWith("/index.m3u8")
      ? trimmedUrl
          .replace("/uploads/video/_hls/", "/uploads/video/")
          .replace("/index.m3u8", ".mp4")
      : null;

  return (
    <section id="showreel" className="w-full">
      <div className="card-shell p-6 sm:p-8">
        <div className="section-header flex items-center justify-between">
          <h3 className="section-title text-2xl text-[color:var(--foreground)]">
            {showreelLabel}
          </h3>
        </div>
        {!hasEmbed && (
          <p className="mt-2 text-sm text-[color:var(--muted)]">
            {t("Video placeholder. Il reel completo sarà aggiornato a breve.", "Placeholder video. Full reel will be updated soon.")}
          </p>
        )}
        <div className="mt-6">
          <div className="video-wrapper">
            {hasEmbed && isHls ? (
              <CaseStudyVideo
                hlsUrl={trimmedUrl}
                mp4Url={mp4Fallback}
                title={showreelLabel}
                poster="https://ui0he7mtsmc0vwcb.public.blob.vercel-storage.com/uploads/video/Showreel%20Sito.jpg"
              />
            ) : hasEmbed && isMp4 ? (
              <video
                className="case-study-video absolute inset-0 h-full w-full rounded-xl"
                controls
                playsInline
                preload="metadata"
                aria-label={t("Video showreel", "Showreel video")}
              >
                <source src={encodeURI(trimmedUrl)} type="video/mp4" />
                {t("Il tuo browser non supporta il tag video.", "Your browser does not support the video tag.")}
              </video>
            ) : hasEmbed ? (
              <iframe
                src={encodeURI(trimmedUrl)}
                title={showreelLabel}
                frameBorder="0"
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video
                className="case-study-video absolute inset-0 h-full w-full rounded-xl"
                controls
                playsInline
                preload="metadata"
                aria-label={t("Video placeholder showreel", "Showreel placeholder video")}
              >
                <source src={PLACEHOLDER_WEBM} type="video/webm" />
                <source src={PLACEHOLDER_MP4} type="video/mp4" />
                {t("Il tuo browser non supporta il tag video.", "Your browser does not support the video tag.")}
              </video>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
