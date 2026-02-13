import type { Metadata } from "next";
import ShowreelSection from "../components/ShowreelSection";
import AudiencePaths from "../components/AudiencePaths";
import HeroSection from "../components/HeroSection";
import HomeSections from "../components/HomeSections";
import LeadQuote from "../components/LeadQuote";
import ProofQuotes from "../components/ProofQuotes";
import { heroCredits } from "../data/homeContent";
import { proofQuotes, proofQuotesLead } from "../data/proofQuotes";
import { getSiteUrl, getShowreelUrl, siteMetadata } from "../lib/siteConfig";

export const metadata: Metadata = {
  title: siteMetadata.title,
  description: siteMetadata.description,
  openGraph: {
    title: siteMetadata.title,
    description: siteMetadata.description,
    type: "website",
    images: [
      {
        url: siteMetadata.ogImage,
        width: 1200,
        height: 630,
        alt: siteMetadata.title,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteMetadata.title,
    description: siteMetadata.description,
    images: [siteMetadata.ogImage],
  },
};

export default function Home() {
  const showreelEmbedUrl = getShowreelUrl();
  const siteUrl = getSiteUrl();

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: siteMetadata.title,
      url: siteUrl,
      description: siteMetadata.description,
      inLanguage: "en",
    },
    {
      "@context": "https://schema.org",
      "@type": "Person",
      name: siteMetadata.title,
      jobTitle: "Composer for film, documentaries, and theatre",
      url: siteUrl,
      description: siteMetadata.description,
    },
  ];

  return (
    <div className="relative min-h-screen page-root">
      <div className="pointer-events-none absolute inset-0 grain z-10" style={{ transform: 'translateZ(0)', contain: 'layout style paint' }} />
      <div className="pointer-events-none absolute -top-40 right-[-80px] h-96 w-96 rounded-full bg-[color:var(--accent)]/20 blur-3xl z-10 max-lg:right-0 max-lg:h-[70vw] max-lg:w-[70vw]" style={{ transform: 'translateZ(0)', contain: 'layout style paint' }} />
      <div className="pointer-events-none absolute bottom-[-180px] left-[-120px] h-[30rem] w-[30rem] rounded-full bg-[color:var(--accent-2)]/70 blur-3xl z-10 max-lg:left-0 max-lg:h-[70vw] max-lg:w-[70vw]" style={{ transform: 'translateZ(0)', contain: 'layout style paint' }} />

      <main className="relative z-20 mx-auto flex min-h-screen max-w-7xl flex-col gap-12 px-6 py-12 lg:px-20">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <HeroSection heroCredits={heroCredits} />

        <LeadQuote quote={proofQuotesLead.quote} attribution={proofQuotesLead.attribution} />

        <ProofQuotes quotes={proofQuotes} />

        <ShowreelSection embedUrl={showreelEmbedUrl} />

        <AudiencePaths />

        <HomeSections />

      </main>
    </div>
  );
}
