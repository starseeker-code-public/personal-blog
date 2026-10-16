/** Languages the site is published in. English is the primary language. */
export const SUPPORTED_LANGS = ['en', 'es'] as const

export type Lang = typeof SUPPORTED_LANGS[number]

/**
 * The fallback for everything: readers whose browser language isn't
 * supported, and posts or strings that haven't been translated yet.
 */
export const DEFAULT_LANG: Lang = 'en'

/** Each language's name, written in that language. */
export const LANG_NAMES: Record<Lang, string> = {
  en: 'English',
  es: 'Español',
}

/** Short codes shown on the navbar's language switch. */
export const LANG_CODES: Record<Lang, string> = {
  en: 'EN',
  es: 'ES',
}

export function isLang(value: string | null | undefined): value is Lang {
  return SUPPORTED_LANGS.includes(value as Lang)
}
