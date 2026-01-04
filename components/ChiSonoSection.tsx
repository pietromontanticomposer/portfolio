import Image from "next/image";

type ChiSonoSectionProps = {
  id?: string;
  imageSrc: string;
  bio: string;
  cvHref?: string;
  quote?: string;
  stats?: Array<{ label: string; value: string }>;
  skills?: string[];
};

export default function ChiSonoSection({
  id,
  imageSrc,
  bio,
  cvHref,
  quote,
  stats,
  skills,
}: ChiSonoSectionProps) {
  const paragraphs = bio
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <section id={id} className="card-shell p-6 sm:p-8">
      <div className="section-header flex items-center justify-between">
        <h3 className="section-title text-2xl text-[color:var(--foreground)]">
          About
        </h3>
      </div>
      <div className="bio-grid mt-6 gap-6">
        <div className="bio-photo">
          <Image
            src={imageSrc}
            alt="Pietro Montanti"
            width={960}
            height={1200}
            className="h-full w-full object-cover"
            priority={false}
          />
        </div>
        <div className="flex flex-col gap-6">
          {quote && (
            <div className="border-l-2 border-[color:var(--accent)] pl-4 py-1">
              <p className="text-base italic text-[color:var(--foreground)] opacity-90">
                &ldquo;{quote}&rdquo;
              </p>
            </div>
          )}

          {stats && stats.length > 0 && (
            <div className="grid grid-cols-3 gap-4">
              {stats.map((stat, index) => (
                <div
                  key={`${stat.label}-${index}`}
                  className="text-center"
                >
                  <div className="text-xl font-semibold text-[color:var(--accent)] mb-1">
                    {stat.value}
                  </div>
                  <div className="text-xs uppercase tracking-wider text-[color:var(--muted-strong)] opacity-80">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-4">
            {paragraphs.length > 0 ? (
              paragraphs.map((paragraph, index) => (
                <p
                  key={`${paragraph.slice(0, 20)}-${index}`}
                  className="bio-text text-sm leading-relaxed text-[color:var(--muted-strong)]"
                >
                  {paragraph}
                </p>
              ))
            ) : (
              <p className="bio-text text-sm leading-relaxed text-[color:var(--muted-strong)]">
                {bio}
              </p>
            )}
          </div>

          {skills && skills.length > 0 && (
            <div>
              <div className="text-xs uppercase tracking-wider text-[color:var(--muted-strong)] opacity-80 mb-3">
                Specializations
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <span
                    key={`${skill}-${index}`}
                    className="px-3 py-1.5 text-xs rounded-full border border-[color:var(--card-border)] bg-[color:var(--card-inset-bg)] text-[color:var(--foreground)] opacity-80"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {cvHref && (
            <a
              href={cvHref}
              className="inline-flex text-sm text-[color:var(--muted-strong)] transition hover:text-[color:var(--foreground)] underline underline-offset-4"
            >
              Download CV
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
