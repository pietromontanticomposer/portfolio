/**
 * Format seconds to MM:SS display format
 */
export const formatTime = (seconds: number): string => {
  if (!Number.isFinite(seconds) || seconds <= 0) return "--:--";
  const mm = Math.floor(seconds / 60).toString().padStart(2, "0");
  const ss = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${mm}:${ss}`;
};

/**
 * Extract title from context string (splits on "—" and returns first part)
 */
export const getTitle = (context: string): string => {
  const split = context.split("—");
  return split[0]?.trim() || context;
};
