/**
 * Parse duration string (MM:SS) to seconds
 */
export function parseDurationToSeconds(value: string | null | undefined): number | null {
  if (!value) return null;
  const match = value.match(/^(\d{2}):(\d{2})$/);
  if (!match) return null;
  const minutes = Number.parseInt(match[1], 10);
  const seconds = Number.parseInt(match[2], 10);
  if (!Number.isFinite(minutes) || !Number.isFinite(seconds)) return null;
  return minutes * 60 + seconds;
}

/**
 * Parse embed URL and return media source info
 */
export function getMediaSources(embedUrl?: string) {
  const trimmedUrl = embedUrl?.trim();
  if (!trimmedUrl) {
    return {
      isHls: false,
      isMp4: false,
      src: null as string | null,
      mp4Fallback: null as string | null,
      posterUrl: null as string | null,
    };
  }

  const lower = trimmedUrl.toLowerCase();
  const isHls = lower.endsWith(".m3u8") || trimmedUrl.includes("/_hls/");
  const isMp4 = lower.endsWith(".mp4") || lower.includes(".mp4");
  const src = trimmedUrl;
  const mp4Fallback = getMp4Fallback(trimmedUrl);
  const posterUrl =
    isMp4 && trimmedUrl.endsWith(".mp4")
      ? trimmedUrl.replace(/\.mp4$/i, ".jpg")
      : mp4Fallback
        ? mp4Fallback.replace(/\.mp4$/i, ".jpg")
        : null;

  return { isHls, isMp4, src, mp4Fallback, posterUrl } as const;
}

function getMp4Fallback(url: string): string | null {
  const hlsSegment = "/uploads/video/_hls/";
  const hlsSuffix = "/index.m3u8";
  if (!url.includes(hlsSegment)) return null;
  if (!url.endsWith(hlsSuffix)) {
    const absoluteMatch = /^https?:\/\//i.test(url);
    if (!absoluteMatch) return null;
  }

  if (/^https?:\/\//i.test(url)) {
    try {
      const parsed = new URL(url);
      if (!parsed.pathname.includes(hlsSegment) || !parsed.pathname.endsWith(hlsSuffix)) {
        return null;
      }
      parsed.pathname = parsed.pathname
        .replace(hlsSegment, "/uploads/video/")
        .replace(hlsSuffix, ".mp4");
      return parsed.toString();
    } catch {
      // Fallback to string replacement below.
    }
  }

  if (!url.endsWith(hlsSuffix)) return null;
  return url
    .replace(hlsSegment, "/uploads/video/")
    .replace(hlsSuffix, ".mp4");
}
