const proofs = [
  {
    title: "Scene first, music second",
    description: "Spotting driven by function, not taste.",
  },
  {
    title: "Fast options, clean revisions",
    description: "A, B, C directions, then decisive locks.",
  },
  {
    title: "Delivery ready for post",
    description: "Stems, naming, versioning, clean exports.",
  },
];

export default function QuickProofs() {
  return (
    <section className="card-shell p-6 sm:p-8" aria-label="What you get">
      <div className="section-header flex items-center justify-between">
        <h3 className="section-title text-2xl text-[color:var(--foreground)]">
          What you get
        </h3>
      </div>
      <div className="mt-6 grid gap-6 md:grid-cols-3">
        {proofs.map((proof) => (
          <div key={proof.title} className="card-inset rounded-2xl p-6">
            <h4 className="text-sm font-semibold text-[color:var(--foreground)]">
              {proof.title}
            </h4>
            <p className="mt-2 text-sm text-[color:var(--muted)]">
              {proof.description}
            </p>
          </div>
        ))}
      </div>
      <p className="mt-6 text-xs uppercase tracking-[0.22em] text-[color:var(--muted)]">
        Process: Spotting · Mockup · Revisions · Lock · Delivery
      </p>
    </section>
  );
}
