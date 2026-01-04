type CaseStudyVideoProps = {
  hlsUrl: string;
  mp4Url?: string | null;
  title: string;
};

const normalizeUrl = (url: string) => (url.startsWith("/") ? encodeURI(url) : url);

export default function CaseStudyVideo({
  hlsUrl,
  mp4Url,
  title,
}: CaseStudyVideoProps) {
  const normalizedHls = normalizeUrl(hlsUrl);
  const normalizedMp4 = mp4Url ? normalizeUrl(mp4Url) : null;
  const posterUrl = normalizedMp4
    ? normalizedMp4.replace(/\.mp4$/i, ".jpg")
    : undefined;

  return (
    <video
      className="case-study-video absolute inset-0 h-full w-full rounded-xl"
      controls
      playsInline
      preload="metadata"
      poster={posterUrl}
      aria-label={title}
    >
      <source src={normalizedHls} type="application/vnd.apple.mpegURL" />
      {normalizedMp4 ? <source src={normalizedMp4} type="video/mp4" /> : null}
      Your browser does not support the video tag.
    </video>
  );
}
