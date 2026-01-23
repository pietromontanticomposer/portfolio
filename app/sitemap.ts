import type { MetadataRoute } from "next";
import { projects } from "../data/projects";

const resolvedSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined);
const siteUrl = resolvedSiteUrl ?? "http://localhost:3000";

if (!resolvedSiteUrl && process.env.NODE_ENV !== "production") {
  console.warn(
    "NEXT_PUBLIC_SITE_URL is not set. Using http://localhost:3000 for sitemap."
  );
}

export default function sitemap(): MetadataRoute.Sitemap {
  const baseEntries: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${siteUrl}/portfolio`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/case-studies`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${siteUrl}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${siteUrl}/cookie-policy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  const projectEntries = projects.filter((project) => !project.isDraft).map(
    (project): MetadataRoute.Sitemap[number] => ({
      url: `${siteUrl}/portfolio/${project.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    })
  );

  return [...baseEntries, ...projectEntries];
}
