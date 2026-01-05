"use client";

type CaseStudyDurationProps = {
  duration: string;
  className?: string;
};

export default function CaseStudyDuration({
  duration,
  className,
}: CaseStudyDurationProps) {
  const baseClass = "case-study-duration-badge";
  return <span className={[baseClass, className].filter(Boolean).join(" ")}>{duration}</span>;
}
