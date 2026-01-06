import type { Language } from "./LanguageContext";
import type { BilingualText } from "../data/caseStudies";
import { tagTranslations } from "../data/tagTranslations";

/**
 * Extract text from a BilingualText object or string based on language
 */
export function getText(text: BilingualText | string | undefined, lang: Language): string {
  if (!text) return "";
  if (typeof text === "string") return text;
  return text[lang] || text.en || "";
}

/**
 * Get translated tag text
 */
export function getTagTranslation(tag: string, lang: Language): string {
  const translation = tagTranslations[tag];
  return translation ? translation[lang] : tag;
}

/**
 * Format timing entry with label
 */
export function formatTimingEntry(
  entry: { time: string; label: BilingualText | string },
  lang: Language
): string {
  const labelText = getText(entry.label, lang)?.trim();
  return labelText ? `${entry.time} ${labelText}` : entry.time;
}
