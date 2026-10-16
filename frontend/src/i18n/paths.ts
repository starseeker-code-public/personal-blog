import { isLang, type Lang } from './config'

/** `/posts/x` → `/es/posts/x`, and `/` → `/es`. */
export function withLang(lang: Lang, path: string): string {
  if (path === '' || path === '/') return `/${lang}`
  return `/${lang}${path.startsWith('/') ? path : `/${path}`}`
}

/** `/es/posts/x` → `/posts/x`, and `/es` → `/`. Paths without a language are returned as they are. */
export function stripLang(pathname: string): string {
  const [, first, ...rest] = pathname.split('/')
  if (!isLang(first)) return pathname || '/'
  return `/${rest.join('/')}`
}
