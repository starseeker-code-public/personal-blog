import type { Lang } from '../config'
import { TAGS_BY_CATEGORY } from '../../data/tags'
import en, { type Messages } from './en'
import es from './es'

export type { Messages }

/** Every locale, keyed by language. Adding a language to `SUPPORTED_LANGS` makes this fail until it has one. */
export const MESSAGES: Record<Lang, Messages> = { en, es }

if (import.meta.env.DEV) {
  const known = new Set(Object.values(TAGS_BY_CATEGORY).flat())
  for (const [lang, messages] of Object.entries(MESSAGES)) {
    for (const tag of Object.keys(messages.tags)) {
      if (!known.has(tag)) console.warn(`i18n/locales/${lang}.ts translates "${tag}", which isn't a tag in data/tags.ts`)
    }
  }
}
