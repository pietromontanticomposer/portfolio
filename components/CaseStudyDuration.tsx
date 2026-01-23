"use client";

type CaseStudyDurationProps = {
  duration: string | null;
  className?: string;
};

export default function CaseStudyDuration({
  duration,
  className,
}: CaseStudyDurationProps) {
  if (!duration) return null;
  const baseClass = "case-study-duration-badge";
  return <span className={[baseClass, className].filter(Boolean).join(" ")}>{duration}</span>;
}
