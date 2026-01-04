import type { Metadata } from "next";
import ContactPopover from "../../components/ContactPopover";
import ChiSonoSection from "../../components/ChiSonoSection";
import { bioFull, bioShort, bioQuote, bioStats, bioSkills } from "../../data/bio";

export const metadata: Metadata = {
  title: "About",
  description: bioShort,
  openGraph: {
    title: "About",
    description: bioShort,
  },
  twitter: {
    card: "summary_large_image",
    title: "About",
    description: bioShort,
  },
};

const PORTRAIT_SRC = "https://4glkq64bdlmmple5.public.blob.vercel-storage.com/uploads/foto-sito.jpg";

export default function AboutPage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-16 lg:px-20">
      <ChiSonoSection
        imageSrc={PORTRAIT_SRC}
        bio={bioFull}
        quote={bioQuote}
        stats={bioStats}
        skills={bioSkills}
      />

      <div className="flex flex-wrap items-center gap-4">
        <ContactPopover
          buttonLabel="Contact"
          buttonClassName="hero-btn hero-btn-primary"
          panelId="contact-popover-about"
        />
      </div>
    </main>
  );
}
