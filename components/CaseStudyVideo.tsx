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

  const normalizedHls = hlsUrl?.trim();
  const normalizedMp4 = mp4Url?.trim() ?? null;
  const posterFromMp4 = normalizedMp4 ? normalizedMp4.replace(/\.mp4$/i, ".jpg") : undefined;
  const posterUrl = poster || posterFromMp4;
  const initialSrc = normalizedMp4 ?? normalizedHls ?? undefined;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      console.error("[CaseStudyVideo] No video element ref");
      return;
    }

    if (!normalizedHls) {
      if (normalizedMp4) {
        video.src = normalizedMp4;
      } else {
        console.error("[CaseStudyVideo] No HLS or MP4 source provided");
      }
      return;
    }

    video.crossOrigin = "anonymous";
    video.muted = false;
    video.volume = 1.0;

    console.log("[CaseStudyVideo] Loading HLS:", normalizedHls);

    // Handler to ensure audio is not muted when video can play
    const handleCanPlay = () => {
      console.log("[CaseStudyVideo] Video can play, ensuring audio is enabled");
      video.muted = false;
      video.volume = 1.0;
    };

    video.addEventListener("canplay", handleCanPlay);

    // If browser natively supports HLS (Safari)
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      console.log("[CaseStudyVideo] Using native HLS support (Safari)");
      video.src = normalizedHls;
      return () => {
        video.removeEventListener("canplay", handleCanPlay);
      };
    }

    // Otherwise use hls.js for Chrome/Firefox
    if (Hls.isSupported()) {
      console.log("[CaseStudyVideo] Using hls.js");
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90,
      });

      hlsRef.current = hls;
      hls.loadSource(normalizedHls);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (_event, data) => {
        console.log("[CaseStudyVideo] Manifest parsed, audio tracks:", data.audioTracks);
        // Ensure audio is enabled after manifest is parsed
        video.muted = false;
        video.volume = 1.0;
      });

      hls.on(Hls.Events.AUDIO_TRACK_LOADED, (_event, data) => {
        console.log("[CaseStudyVideo] Audio track loaded:", data);
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        console.error("[CaseStudyVideo] HLS error:", data);
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.error("HLS network error, trying to recover...");
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.error("HLS media error, trying to recover...");
              hls.recoverMediaError();
              break;
            default:
              console.error("HLS fatal error, destroying instance");
              hls.destroy();
              if (normalizedMp4) {
                console.log("[CaseStudyVideo] Switching to MP4 fallback after fatal error");
                video.src = normalizedMp4;
              }
              break;
          }
        }
      });

      return () => {
        video.removeEventListener("canplay", handleCanPlay);
        if (hlsRef.current) {
          hlsRef.current.destroy();
          hlsRef.current = null;
        }
      };
    }

    // Fallback to MP4 if available
    if (normalizedMp4) {
      console.log("[CaseStudyVideo] Falling back to MP4:", normalizedMp4);
      video.src = normalizedMp4;
    }

    return () => {
      video.removeEventListener("canplay", handleCanPlay);
    };
  }, [normalizedHls, normalizedMp4]);

  return (
    <video
      ref={videoRef}
      className="case-study-video absolute inset-0 h-full w-full rounded-xl"
      controls
      playsInline
      preload="auto"
      crossOrigin="anonymous"
      poster={posterUrl}
      src={initialSrc}
      aria-label={title}
    >
      {/* Source is set programmatically via hls.js or native HLS support */}
      Your browser does not support the video tag.
    </video>
  );
}
