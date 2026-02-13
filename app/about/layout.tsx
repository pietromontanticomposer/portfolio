import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "Composer for film and media with remote workflow and post-ready delivery standards.",
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
