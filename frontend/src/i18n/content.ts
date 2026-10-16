import type { AdminPost } from '../types'
import type { Lang } from './config'
import { MESSAGES } from './locales'

/**
 * The parts of a post written once per language. Everything else — cover
 * image, category, tags, draft flag — is shared by both versions.
 */
export interface PostContent {
  title: string
  excerpt: string
  body: string
}

export const EMPTY_CONTENT: PostContent = { title: '', excerpt: '', body: '' }

export type ContentStatus = 'empty' | 'partial' | 'complete'

/** Mirrors the backend: a language is published once it has both a title and a body. */
export function contentStatus(c: PostContent): ContentStatus {
  const hasTitle = c.title.trim() !== ''
  const hasBody = c.body.trim() !== ''
  if (hasTitle && hasBody) return 'complete'
  if (hasTitle || hasBody || c.excerpt.trim() !== '') return 'partial'
  return 'empty'
}

/** An admin post's content, per language. */
export function adminContent(p: AdminPost): Record<Lang, PostContent> {
  return {
    en: { title: p.title, excerpt: p.excerpt, body: p.body },
    es: { title: p.titleEs, excerpt: p.excerptEs, body: p.bodyEs },
  }
}

/**
 * What the composer asks before publishing a post whose translation into
 * `lang` isn't finished, or null when there's nothing to ask. (The admin
 * pages are in English.)
 */
export function missingTranslationWarning(lang: Lang, status: ContentStatus): string | null {
  const name = MESSAGES.en.languages[lang]
  if (status === 'complete') return null
  if (status === 'empty') {
    return `There's no ${name} version yet, so readers of the ${name} site will get the English post. Publish anyway?`
  }
  return `The ${name} version is unfinished (it needs a title and a body), so readers of the ${name} site will get the English post. Publish anyway?`
}
