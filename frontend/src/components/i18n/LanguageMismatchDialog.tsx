import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { MESSAGES, preferredLang, saveLang, stripLang, useI18n, withLang, type Lang } from '../../i18n'
import { IcoGlobe } from '../icons'

/**
 * Offers the reader's own language when they land on a page in the other one
 * (a shared link, say). It's written in the reader's language, and either
 * answer is remembered, so it only asks once; the navbar switch changes the
 * choice later. Escape or a click outside means "stay".
 */
export function LanguageMismatchDialog() {
  const { lang } = useI18n()
  const { pathname, search, hash } = useLocation()
  const navigate = useNavigate()
  const [suggested, setSuggested] = useState<Lang | null>(null)

  useEffect(() => {
    const preferred = preferredLang()
    setSuggested(preferred === lang ? null : preferred)
  }, [lang])

  useEffect(() => {
    if (!suggested) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        saveLang(lang)
        setSuggested(null)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [suggested, lang])

  if (!suggested) return null

  const target = suggested
  const m = MESSAGES[target]
  const current = m.languages[lang]
  const preferred = m.languages[target]

  const stay = () => {
    saveLang(lang)
    setSuggested(null)
  }

  const switchLang = () => {
    saveLang(target)
    setSuggested(null)
    navigate(`${withLang(target, stripLang(pathname))}${search}${hash}`, { replace: true })
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-stone-950/40 dark:bg-black/60 backdrop-blur-sm"
      onClick={stay}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="language-dialog-title"
        aria-describedby="language-dialog-body"
        lang={target}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-sm rounded-xl border border-stone-300 dark:border-[#322d5a] bg-[#faf6ee] dark:bg-[#1a1735] p-6 shadow-xl"
      >
        <div className="flex items-center gap-2.5 mb-3 text-[#798777] dark:text-amber-400">
          <IcoGlobe />
          <h2
            id="language-dialog-title"
            className="text-stone-900 dark:text-[#f0ecfd] font-semibold"
            style={{ fontFamily: 'Capriola' }}
          >
            {m.languageDialog.title(current)}
          </h2>
        </div>
        <p id="language-dialog-body" className="text-stone-600 dark:text-[#c9beed] text-sm leading-relaxed mb-6">
          {m.languageDialog.body(preferred)}
        </p>
        <div className="flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={stay}
            className="px-4 py-2 rounded-lg border border-stone-300 dark:border-[#322d5a] text-stone-600 dark:text-[#c9beed] text-sm hover:border-[#2a3428] hover:text-[#2a3428] dark:hover:border-amber-500 dark:hover:text-[#f0ecfd] transition-colors"
          >
            {m.languageDialog.stayIn(current)}
          </button>
          <button
            type="button"
            onClick={switchLang}
            autoFocus
            className="px-4 py-2 rounded-lg bg-[#2a3428] hover:bg-[#3a4838] dark:bg-amber-500 dark:hover:bg-amber-400 text-[#f5f0e2] dark:text-[#0f0d24] text-sm font-medium transition-colors"
          >
            {m.languageDialog.switchTo(preferred)}
          </button>
        </div>
      </div>
    </div>
  )
}
