import { TEMPLATE_CATALOGUE, type TemplateDefinition } from './catalogue'

/**
 * Post templates for the composer's "Template" menu. Picking one switches to
 * its post category, replaces the body with its Markdown skeleton, and
 * highlights its suggested tags.
 *
 * Bodies are picked up from `bodies/<id>.md` at build time, so adding a
 * template is just dropping in a Markdown file named after a catalogue id.
 */
export interface PostTemplate extends TemplateDefinition {
  body?: string
}

export interface PostTemplateGroup {
  label: string
  templates: readonly PostTemplate[]
}

const BODY_FILES = import.meta.glob<string>('./bodies/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
})

const BODIES: Record<string, string> = Object.fromEntries(
  Object.entries(BODY_FILES).map(([path, body]) => [path.replace(/^\.\/bodies\/|\.md$/g, ''), body]),
)

export const POST_TEMPLATE_GROUPS: readonly PostTemplateGroup[] = TEMPLATE_CATALOGUE.map(g => ({
  label: g.label,
  templates: g.templates.map(t => ({ ...t, body: BODIES[t.bodyId ?? t.id] })),
}))

if (import.meta.env.DEV) {
  const ids = new Set(TEMPLATE_CATALOGUE.flatMap(g => g.templates.map(t => t.bodyId ?? t.id)))
  for (const id of Object.keys(BODIES)) {
    if (!ids.has(id)) console.warn(`templates/bodies/${id}.md has no matching entry in templates/catalogue.ts`)
  }
}
