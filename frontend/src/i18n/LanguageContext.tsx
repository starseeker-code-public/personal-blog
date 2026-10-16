import { createContext, useContext, useEffect, useMemo } from 'react'
import { format } from 'date-fns'
import { DEFAULT_LANG, type Lang } from './config'
import { MESSAGES, type Messages } from './locales'
import { withLang } from './paths'

export interface I18n {
  /** The page's language, taken from the URL. */
  lang: Lang
  /** UI strings in that language. */
  m: Messages
  /** An app path in this language: `path('/about')` → `/es/about`. */
  path: (to: string) => string
  /** An ISO date formatted for this language. */
  date: (iso: string, style?: 'long' | 'short') => string
  /** A category name (stored in English) in this language. */
  category: (name: string) => string
  /** A tag (stored in English) in this language. */
  tag: (name: string) => string
}

function makeI18n(lang: Lang): I18n {
  const m = MESSAGES[lang]
  return {
    lang,
    m,
    path: to => withLang(lang, to),
    date: (iso, style = 'long') => format(new Date(iso), m.dates[style], { locale: m.dates.locale }),
    category: name => m.categories[name] ?? name,
    tag: name => m.tags[name] ?? name,
  }
}

// Outside a language route (the admin pages) everything falls back to English.
const LanguageContext = createContext<I18n>(makeI18n(DEFAULT_LANG))

export function LanguageProvider({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  const value = useMemo(() => makeI18n(lang), [lang])

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export const useI18n = () => useContext(LanguageContext)
