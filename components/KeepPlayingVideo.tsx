"use client";

import { useRef } from "react";
import type { ReactNode, VideoHTMLAttributes } from "react";
import useResumeVideoOnVisibility from "./useResumeVideoOnVisibility";

type KeepPlayingVideoProps = VideoHTMLAttributes<HTMLVideoElement> & {
  children?: ReactNode;
};

export default function KeepPlayingVideo({
  children,
  ...props
}: KeepPlayingVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  useResumeVideoOnVisibility(videoRef);

  return (
    <video ref={videoRef} {...props}>
      {children}
    </video>
  );
}
