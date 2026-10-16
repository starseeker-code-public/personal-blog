/**
 * Client-side slug helper. Mirrors python-slugify's defaults, so the links
 * built here match the slugs the backend stores: "ci/cd" → "ci-cd",
 * "Café" → "cafe".
 */
export function slugify(text: string): string {
  return text
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
