import type { Metadata } from "next";
import ContactPopover from "../../components/ContactPopover";
import { projects } from "../../data/projects";

export const metadata: Metadata = {
  title: "For Producers",
  description:
    "Schedule-safe scoring with clean delivery, clear naming, and post-ready exports.",
  openGraph: {
    title: "For Producers",
    description:
      "Schedule-safe scoring with clean delivery, clear naming, and post-ready exports.",
  },
  twitter: {
    card: "summary_large_image",
    title: "For Producers",
    description:
      "Schedule-safe scoring with clean delivery, clear naming, and post-ready exports.",
  },
};

const steps = [
  {
    title: "Spotting and brief",
    detail: "Clear scope, cue list, and delivery expectations from day one.",
  },
  {
    title: "Options A/B/C",
    detail: "Fast direction choices that reduce schedule risk.",
  },
  {
    title: "Lock window",
    detail: "Short revision window to finalize timing and intent.",
  },
  {
    title: "Delivery pack",
    detail: "Versioned exports with clean naming and organized handoff.",
  },
];

const deliveryChecklist = [
  "Stereo mix plus stems on request",
  "Consistent naming and versioning",
  "Mix variants for dialogue and effects",
  "Cue sheet and timings",
  "Single delivery link with structured folders",
];

const caseStudyProjects = projects.filter((project) => project.description).slice(2, 4);
const fallbackCaseStudies = projects.slice(0, 2);
const producerCaseStudies =
  caseStudyProjects.length > 0 ? caseStudyProjects : fallbackCaseStudies;

const caseStudies = producerCaseStudies.map((project) => {
  const lines = String(project.description ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return {
    title: project.title,
    brief:
      lines[0] ||
      `${project.title} (${project.tag ?? "Project"}) with clear delivery scope.`,
    musicalChoice:
      lines[1] ||
      "Focused on stable timing and clean dynamics for predictable post workflows.",
    deliverables: "Versioned exports, naming, stems on request, cue sheet.",
  };
});

export default function ForProducersPage() {
  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-16 lg:px-20">
      <section className="card-shell p-8">
        <h1 className="section-title text-4xl text-[color:var(--foreground)]">
          For Producers
        </h1>
        <p className="mt-3 text-sm text-[color:var(--muted)]">
          Schedule-safe scoring with clean delivery and predictable handoff. I
          keep revisions tight and exports organized so post can move fast.
        </p>
        <div className="mt-6">
          <ContactPopover
            buttonLabel="Contact"
            buttonClassName="hero-btn hero-btn-primary"
            panelId="contact-popover-producers-hero"
          />
        </div>
      </section>

      <section className="card-shell p-8">
        <h2 className="section-title text-2xl text-[color:var(--foreground)]">
          How I work
        </h2>
        <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <li key={step.title}>
              <h3 className="text-sm font-semibold text-[color:var(--foreground)]">
                {i + 1}. {step.title}
              </h3>
              <p className="mt-2 text-sm text-[color:var(--muted)]">
                {step.detail}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section className="card-shell p-8">
        <h2 className="section-title text-2xl text-[color:var(--foreground)]">
          Delivery ready for post
        </h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-[color:var(--muted)]">
          {deliveryChecklist.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="card-shell p-8">
        <h2 className="section-title text-2xl text-[color:var(--foreground)]">
          Delivery case studies
        </h2>
        <div className="mt-6 grid gap-8 md:grid-cols-2">
          {caseStudies.map((study) => (
            <div key={study.title}>
              <h3 className="text-lg font-semibold text-[color:var(--foreground)]">
                {study.title}
              </h3>
              <div className="mt-4 space-y-3 text-sm text-[color:var(--muted)]">
                <div>
                  <span className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
                    Brief
                  </span>
                  <p className="mt-1">{study.brief}</p>
                </div>
                <div>
                  <span className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
                    Musical choice
                  </span>
                  <p className="mt-1">{study.musicalChoice}</p>
                </div>
                <div>
                  <span className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
                    Deliverables
                  </span>
                  <p className="mt-1">{study.deliverables}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="card-shell p-8">
        <h2 className="section-title text-2xl text-[color:var(--foreground)]">
          Need a clean delivery pack?
        </h2>
        <p className="mt-2 text-sm text-[color:var(--muted)]">
          Share the schedule, formats, and post requirements. I will reply with
          a delivery plan.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <ContactPopover
            buttonLabel="Contact"
            buttonClassName="hero-btn hero-btn-primary"
            panelId="contact-popover-producers-cta"
          />
        </div>
      </section>
    </main>
  );
}
