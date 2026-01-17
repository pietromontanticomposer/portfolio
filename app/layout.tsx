import type { Metadata } from "next";
import { Bodoni_Moda, Work_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Footer from "../components/Footer";
import ScrollController from "../components/ScrollController";
import BackgroundVideo from "../components/BackgroundVideo";
import Header from "../components/Header";
import ScrollPerformance from "../components/ScrollPerformance";
import { LanguageProvider } from "../lib/LanguageContext";
import { getSiteUrl, siteMetadata } from "../lib/siteConfig";

// Optimized font loading - reduced weights to critical only
const bodoni = Bodoni_Moda({
  variable: "--font-bodoni",
  subsets: ["latin"],
  weight: ["400", "600"],
  display: 'swap',
  preload: true,
});

const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: 'swap',
  preload: true,
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400"],
  display: 'swap',
  preload: true,
});

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteMetadata.title,
    template: "%s | Pietro Montanti",
  },
  description: siteMetadata.description,
  openGraph: {
    title: siteMetadata.title,
    description: siteMetadata.description,
    url: siteUrl,
    siteName: siteMetadata.title,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteMetadata.title,
    description: siteMetadata.description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const SHOW_BG_VIDEO = true;
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="preconnect"
          href="https://4glkq64bdlmmple5.public.blob.vercel-storage.com"
          crossOrigin="anonymous"
        />
        <link
          rel="dns-prefetch"
          href="https://4glkq64bdlmmple5.public.blob.vercel-storage.com"
        />
        <link
          rel="preconnect"
          href="https://ui0he7mtsmc0vwcb.public.blob.vercel-storage.com"
          crossOrigin="anonymous"
        />
        <link
          rel="dns-prefetch"
          href="https://ui0he7mtsmc0vwcb.public.blob.vercel-storage.com"
        />
        <link
          rel="preload"
          as="image"
          href="https://4glkq64bdlmmple5.public.blob.vercel-storage.com/background-poster.jpg"
        />
      </head>
      <body
        className={`${bodoni.variable} ${workSans.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <LanguageProvider>
          <Header />
          {SHOW_BG_VIDEO && <BackgroundVideo />}
          <ScrollController />
          <ScrollPerformance />
          {children}
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}
