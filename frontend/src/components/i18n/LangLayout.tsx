import { Navigate, Outlet, useLocation, useParams } from 'react-router-dom'
import { LanguageProvider, isLang, preferredLang, withLang } from '../../i18n'
import { LanguageMismatchDialog } from './LanguageMismatchDialog'

/** Parent route of every public page (`/:lang/...`): provides the language to everything below it. */
export function LangLayout() {
  const { lang } = useParams<{ lang: string }>()

  if (!isLang(lang)) return <LangRedirect />

  return (
    <LanguageProvider lang={lang}>
      <Outlet />
      <LanguageMismatchDialog />
    </LanguageProvider>
  )
}

/**
 * Sends a path without a language — `/`, or a link from before the site was
 * bilingual such as `/posts/x` — to the same page in the reader's language.
 */
export function LangRedirect() {
  const { pathname, search, hash } = useLocation()
  return <Navigate replace to={`${withLang(preferredLang(), pathname)}${search}${hash}`} />
}
