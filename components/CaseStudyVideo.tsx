"use client";

import { useEffect, useRef } from "react";
import Hls from "hls.js";

type CaseStudyVideoProps = {
  hlsUrl: string;
  mp4Url?: string | null;
  title: string;
  poster?: string | null;
};

export default function CaseStudyVideo({
  hlsUrl,
  mp4Url,
  title,
  poster,
}: CaseStudyVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  // URLs are already encoded in MediaBlock, don't encode again
  const normalizedHls = hlsUrl;
  const normalizedMp4 = mp4Url;
  // Don't auto-derive poster URLs - use explicit poster prop only
  const posterUrl = poster || undefined;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Se il browser supporta nativamente HLS (Safari)
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = normalizedHls;
      return;
    }

    // Altrimenti usa hls.js per Chrome/Firefox
    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90,
      });

      hlsRef.current = hls;
      hls.loadSource(normalizedHls);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        // Video ready to play
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.error('HLS network error, trying to recover...');
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.error('HLS media error, trying to recover...');
              hls.recoverMediaError();
              break;
            default:
              console.error('HLS fatal error, destroying instance');
              hls.destroy();
              break;
          }
        }
      });

      return () => {
        if (hlsRef.current) {
          hlsRef.current.destroy();
          hlsRef.current = null;
        }
      };
    }

    // Fallback a MP4 se disponibile
    if (normalizedMp4) {
      video.src = normalizedMp4;
    }
  }, [normalizedHls, normalizedMp4]);

  return (
    <video
      ref={videoRef}
      className="case-study-video absolute inset-0 h-full w-full rounded-xl"
      controls
      playsInline
      preload="metadata"
      poster={posterUrl}
      aria-label={title}
    >
      {normalizedMp4 ? <source src={normalizedMp4} type="video/mp4" /> : null}
      Your browser does not support the video tag.
    </video>
  );
}
