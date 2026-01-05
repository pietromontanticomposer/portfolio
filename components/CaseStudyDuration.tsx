"use client";

import { useEffect, useMemo, useState } from "react";

type CaseStudyDurationProps = {
  embedUrl?: string;
  fallback?: string;
  className?: string;
};

const normalizeUrl = (url: string) => (url.startsWith("/") ? encodeURI(url) : url);

const formatDuration = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

const getPlayableUrl = (embedUrl?: string) => {
  const trimmedUrl = embedUrl?.trim();
  if (!trimmedUrl) return null;
  if (
    trimmedUrl.startsWith("/uploads/video/_hls/") &&
    trimmedUrl.endsWith("/index.m3u8")
  ) {
    return trimmedUrl
      .replace("/uploads/video/_hls/", "/uploads/video/")
      .replace("/index.m3u8", ".mp4");
  }
  return trimmedUrl;
};

export default function CaseStudyDuration({
  embedUrl,
  fallback = "00:--",
  className,
}: CaseStudyDurationProps) {
  const [duration, setDuration] = useState<number | null>(null);
  const playableUrl = useMemo(() => getPlayableUrl(embedUrl), [embedUrl]);

  useEffect(() => {
    if (!playableUrl) return;

    const video = document.createElement("video");
    const normalizedUrl = normalizeUrl(playableUrl);
    let timeoutId: ReturnType<typeof setTimeout>;

    const handleLoadedMetadata = () => {
      clearTimeout(timeoutId);
      const nextDuration = Number.isFinite(video.duration) ? video.duration : null;
      setDuration(nextDuration);
    };

    const handleError = () => {
      clearTimeout(timeoutId);
      console.warn(`Failed to load video metadata for ${normalizedUrl}`);
    };

    // Set a 10-second timeout for metadata loading
    timeoutId = setTimeout(() => {
      console.warn(`Timeout loading video metadata for ${normalizedUrl}`);
      video.src = "";
    }, 10000);

    video.preload = "metadata";
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("error", handleError);
    video.src = normalizedUrl;

    return () => {
      clearTimeout(timeoutId);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("error", handleError);
      video.src = "";
    };
  }, [playableUrl]);

  const label = duration ? formatDuration(duration) : fallback;

  const baseClass = "case-study-duration-badge";
  return <span className={[baseClass, className].filter(Boolean).join(" ")}>{label}</span>;
}
