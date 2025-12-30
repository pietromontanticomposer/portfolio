import type { Metadata } from "next";
import { Bodoni_Moda, Work_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Footer from "../components/Footer";
import ScrollController from "../components/ScrollController";
import BackgroundVideo from "../components/BackgroundVideo";
import ScrollPerformance from "../components/ScrollPerformance";

const bodoni = Bodoni_Moda({
  variable: "--font-bodoni",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: 'swap',
});

const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "600"],
  display: 'swap',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined)
  ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Pietro Montanti - Composer for Film and Media",
  description:
    "Pietro Montanti is a composer and music producer for film and visual media. Original scores, sound design, and narrative music.",
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
          rel="preload"
          as="image"
          href="https://4glkq64bdlmmple5.public.blob.vercel-storage.com/background-poster.jpg"
        />
      </head>
      <body
        className={`${bodoni.variable} ${workSans.variable} ${jetbrainsMono.variable} antialiased`}
      >
        {SHOW_BG_VIDEO && <BackgroundVideo />}
        <ScrollController />
        <ScrollPerformance />
        {children}
        <Footer />
      </body>
    </html>
  );
}
