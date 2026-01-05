"use client";

import { useEffect, useRef, useState } from "react";

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
  const hlsRef = useRef<unknown>(null);
  const [isHlsLoaded, setIsHlsLoaded] = useState(false);

  const normalizedHls = hlsUrl?.trim();
  const normalizedMp4 = mp4Url?.trim() ?? null;
  const posterFromMp4 = normalizedMp4 ? normalizedMp4.replace(/\.mp4$/i, ".jpg") : undefined;
  const posterUrl = poster || posterFromMp4;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (!normalizedHls) {
      if (normalizedMp4) {
        video.src = normalizedMp4;
      }
      return;
    }

    video.crossOrigin = "anonymous";
    video.muted = false;
    video.volume = 1.0;

    const handleCanPlay = () => {
      video.muted = false;
      video.volume = 1.0;
    };

    video.addEventListener("canplay", handleCanPlay);

    // If browser natively supports HLS (Safari)
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = normalizedHls;
      return () => {
        video.removeEventListener("canplay", handleCanPlay);
      };
    }

    // Dynamic import hls.js to reduce bundle size (~80KB saved)
    let mounted = true;
    import("hls.js").then((HlsModule) => {
      if (!mounted || !video) return;
      
      const Hls = HlsModule.default;
      
      if (!Hls.isSupported()) {
        // Fallback to MP4 if HLS not supported
        if (normalizedMp4) {
          video.src = normalizedMp4;
        }
        return;
      }

      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 30, // Reduced from 90
        maxBufferLength: 10, // More conservative buffering
      });

      hlsRef.current = hls;
      hls.loadSource(normalizedHls);
      hls.attachMedia(video);
      setIsHlsLoaded(true);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.muted = false;
        video.volume = 1.0;
      });

      hls.on(Hls.Events.ERROR, (_event: unknown, data: { fatal?: boolean; type?: string }) => {
        if (data.fatal) {
          const HlsErrorTypes = Hls.ErrorTypes as { NETWORK_ERROR: string; MEDIA_ERROR: string };
          switch (data.type) {
            case HlsErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case HlsErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              hls.destroy();
              if (normalizedMp4) {
                video.src = normalizedMp4;
              }
              break;
          }
        }
      });
    }).catch(() => {
      // Fallback to MP4 if hls.js fails to load
      if (normalizedMp4 && video) {
        video.src = normalizedMp4;
      }
    });

    return () => {
      mounted = false;
      video.removeEventListener("canplay", handleCanPlay);
      if (hlsRef.current) {
        (hlsRef.current as { destroy: () => void }).destroy();
        hlsRef.current = null;
      }
    };
  }, [normalizedHls, normalizedMp4]);

  // Set initial src only for MP4 fallback or native HLS
  const initialSrc = !isHlsLoaded ? (normalizedMp4 ?? undefined) : undefined;

  return (
    <video
      ref={videoRef}
      className="case-study-video absolute inset-0 h-full w-full rounded-xl"
      controls
      playsInline
      preload="metadata"
      crossOrigin="anonymous"
      poster={posterUrl}
      src={initialSrc}
      aria-label={title}
    >
      Your browser does not support the video tag.
    </video>
  );
}
