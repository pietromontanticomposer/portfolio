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

    const handleLoadedMetadata = () => {
      const nextDuration = Number.isFinite(video.duration) ? video.duration : null;
      setDuration(nextDuration);
    };

    video.preload = "metadata";
    video.src = normalizedUrl;
    video.addEventListener("loadedmetadata", handleLoadedMetadata);

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.src = "";
    };
  }, [playableUrl]);

  const label = duration ? formatDuration(duration) : fallback;

  const baseClass = "case-study-duration-badge";
  return <span className={[baseClass, className].filter(Boolean).join(" ")}>{label}</span>;
}
