import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { projects } from "../../../data/projects";
import { getText } from "../../../lib/translations";
import ProjectPageClient from "./ProjectPageClient";

type Params = { params: { slug: string } | Promise<{ slug: string }> };

export function generateStaticParams() {
  return projects.filter((project) => !project.isDraft).map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(params);
  const project = projects.find((p) => p.slug === resolvedParams.slug && !p.isDraft);
  if (!project) return {};

  const title = `${project.title} — Pietro Montanti`;
  const descriptionText = getText(project.description, "en");
  const description = descriptionText.split("\n")[0] || "Project by Pietro Montanti.";
  const image = project.image ?? project.largeImage;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: image ? [{ url: image }] : undefined,
      type: "article",
    },
  };
}

export default async function ProjectPage({ params }: Params) {
  const resolvedParams = await Promise.resolve(params);
  const project = projects.find((p) => p.slug === resolvedParams.slug && !p.isDraft);
  if (!project) return notFound();

  return <ProjectPageClient project={project} />;
}
