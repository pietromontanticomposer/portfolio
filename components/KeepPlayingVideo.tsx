"use client";

import { useEffect, useRef } from "react";
import type { ReactNode, VideoHTMLAttributes } from "react";
import useResumeVideoOnVisibility from "./useResumeVideoOnVisibility";

type KeepPlayingVideoProps = VideoHTMLAttributes<HTMLVideoElement> & {
  children?: ReactNode;
  onFirstFrame?: () => void;
};

export default function KeepPlayingVideo({
  children,
  onFirstFrame,
  ...props
}: KeepPlayingVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const firstFrameFired = useRef(false);
  useResumeVideoOnVisibility(videoRef, { keepPlayingWhenHidden: true });

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !onFirstFrame) return;

    const handleFirstFrame = () => {
      if (firstFrameFired.current) return;
      if (video.currentTime > 0.05 || !video.paused) {
        firstFrameFired.current = true;
        onFirstFrame();
      }
    };

    video.addEventListener("playing", handleFirstFrame);
    video.addEventListener("timeupdate", handleFirstFrame);

    return () => {
      video.removeEventListener("playing", handleFirstFrame);
      video.removeEventListener("timeupdate", handleFirstFrame);
    };
  }, [onFirstFrame]);

  return (
    <video ref={videoRef} {...props}>
      {children}
    </video>
  );
}
