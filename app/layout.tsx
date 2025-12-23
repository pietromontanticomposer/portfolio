import type { Metadata } from "next";
import { Bodoni_Moda, Work_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Footer from "../components/Footer";
import ScrollController from "../components/ScrollController";

const bodoni = Bodoni_Moda({
  variable: "--font-bodoni",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["300", "400", "600"],
});

export const metadata: Metadata = {
  title: "Portfolio - Creative Direction",
  description:
    "Digital portfolio with selected projects, creative direction, and web development.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Toggle this to `true` to re-enable the full-screen background video
  const SHOW_BG_VIDEO = true;
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${bodoni.variable} ${workSans.variable} ${jetbrainsMono.variable} antialiased`}
      >
        {/* Full-screen background video (temporarily disabled) */}
        {SHOW_BG_VIDEO && (
          <>
            <video
              className="bg-video"
              src="/background.mp4"
              autoPlay
              muted
              loop
              playsInline
              disablePictureInPicture
              controlsList="nodownload noremoteplayback"
              preload="auto"
              poster="/background-poster.jpg"
              aria-hidden="true"
            />
            <div className="bg-video-overlay" aria-hidden="true" />
          </>
        )}
        <ScrollController />
        {children}
        <Footer />
      </body>
    </html>
  );
}
