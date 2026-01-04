import type { Metadata } from "next";
import { Bodoni_Moda, Work_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Footer from "../components/Footer";
import ScrollController from "../components/ScrollController";
import BackgroundVideo from "../components/BackgroundVideo";
import Header from "../components/Header";

// Optimized font loading - reduced weights to critical only
const bodoni = Bodoni_Moda({
  variable: "--font-bodoni",
  subsets: ["latin"],
  weight: ["400", "600"], // Removed 500, only use 400 and 600
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
  weight: ["400"], // Removed 600, only use 400 for mono
  display: 'swap',
  preload: true,
});

const resolvedSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined);
const siteUrl = resolvedSiteUrl ?? "http://localhost:3000";
const defaultTitle = "Pietro Montanti";
const defaultDescription =
  "Composer for Film and Media. Music that supports edit, tension, and character.";

if (!resolvedSiteUrl && process.env.NODE_ENV !== "production") {
  console.warn(
    "NEXT_PUBLIC_SITE_URL is not set. Using http://localhost:3000 for metadata."
  );
}

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: defaultTitle,
    template: "%s | Pietro Montanti",
  },
  description: defaultDescription,
  openGraph: {
    title: defaultTitle,
    description: defaultDescription,
    url: siteUrl,
    siteName: defaultTitle,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultDescription,
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
          rel="preload"
          as="image"
          href="https://4glkq64bdlmmple5.public.blob.vercel-storage.com/background-poster.jpg"
        />
      </head>
      <body
        className={`${bodoni.variable} ${workSans.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <Header />
        {SHOW_BG_VIDEO && <BackgroundVideo />}
        <ScrollController />
        {children}
        <Footer />
      </body>
    </html>
  );
}
