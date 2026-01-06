// Site configuration utilities

export const getSiteUrl = (): string => {
  const resolved =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined);
  return resolved ?? "http://localhost:3000";
};

export const getShowreelUrl = (): string => {
  return (
    process.env.NEXT_PUBLIC_SHOWREEL_EMBED_URL ??
    "https://ui0he7mtsmc0vwcb.public.blob.vercel-storage.com/uploads/video/_hls/Showreel%20Sito%20New/index.m3u8"
  );
};

export const siteMetadata = {
  title: "Pietro Montanti",
  description: "Composer for Film and Media. Music that supports edit, tension, and character.",
} as const;
