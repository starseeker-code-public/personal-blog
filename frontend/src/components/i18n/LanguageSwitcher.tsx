import { Link, useLocation } from 'react-router-dom'
import { LANG_CODES, LANG_NAMES, SUPPORTED_LANGS, saveLang, stripLang, useI18n, withLang } from '../../i18n'

/** EN | ES switch for the navbar. Keeps the reader on the same page and remembers the choice. */
export function LanguageSwitcher() {
  const { lang, m } = useI18n()
  const { pathname, search, hash } = useLocation()
  const here = stripLang(pathname)

  return (
    <div
      role="group"
      aria-label={m.nav.language}
      className="flex items-center rounded-lg border border-stone-300/80 dark:border-[#322d5a] p-0.5 text-[11px] font-medium tracking-wider"
    >
      {SUPPORTED_LANGS.map(l =>
        l === lang ? (
          <span
            key={l}
            aria-current="true"
            aria-label={LANG_NAMES[l]}
            title={LANG_NAMES[l]}
            className="px-1.5 py-0.5 rounded-md bg-[#2a3428] text-[#f0ead8] dark:bg-amber-500 dark:text-[#0f0d24]"
          >
            {LANG_CODES[l]}
          </span>
        ) : (
          <Link
            key={l}
            to={`${withLang(l, here)}${search}${hash}`}
            onClick={() => saveLang(l)}
            hrefLang={l}
            lang={l}
            aria-label={LANG_NAMES[l]}
            title={LANG_NAMES[l]}
            className="px-1.5 py-0.5 rounded-md text-stone-500 dark:text-[#8b7db8] hover:text-[#dd0000] dark:hover:text-amber-400 transition-colors"
          >
            {LANG_CODES[l]}
          </Link>
        ),
      )}
    </div>
  )
}
