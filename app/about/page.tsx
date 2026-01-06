"use client";

import ContactPopover from "../../components/ContactPopover";
import ChiSonoSection from "../../components/ChiSonoSection";
import { bioFull, bioShort, bioQuote, bioStats, bioSkills } from "../../data/bio";
import { useLanguage } from "../../lib/LanguageContext";

const PORTRAIT_SRC = "https://4glkq64bdlmmple5.public.blob.vercel-storage.com/optimized/uploads/foto-sito.webp";

export default function AboutPage() {
  const { t } = useLanguage();

  return (
    <main className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-16 lg:px-20">
      <ChiSonoSection
        imageSrc={PORTRAIT_SRC}
        bio={bioFull}
        quote={bioQuote}
        stats={bioStats}
        skills={bioSkills}
        priorityImage
      />

      <div className="flex flex-wrap items-center gap-4">
        <ContactPopover
          buttonLabel={t("Contattami", "Contact")}
          buttonClassName="hero-btn hero-btn-primary"
          panelId="contact-popover-about"
        />
      </div>
    </main>
  );
}
