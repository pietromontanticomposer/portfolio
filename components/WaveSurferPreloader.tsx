"use client";
import { useEffect } from "react";
import { preloadWaveSurfer } from "./AudioPlayer";

// Preloads WaveSurfer.js module on page load for faster first-track playback
export default function WaveSurferPreloader() {
  useEffect(() => {
    // Start preloading after a short delay to not block critical resources
    const timer = setTimeout(() => {
      preloadWaveSurfer();
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return null;
}
