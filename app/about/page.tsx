"use client";

import ChiSonoSection from "../../components/ChiSonoSection";
import { bioFull, bioQuote } from "../../data/bio";

const PORTRAIT_SRC = "https://4glkq64bdlmmple5.public.blob.vercel-storage.com/optimized/uploads/foto-sito.webp";

export default function AboutPage() {
  return (
    <main className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-16 lg:px-20">
      <ChiSonoSection
        imageSrc={PORTRAIT_SRC}
        bio={bioFull}
        quote={bioQuote}
        priorityImage
      />
    </main>
  );
}
