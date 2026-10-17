import { useEffect } from 'react'
import { SITE } from '../data'
import { DEFAULT_LANG, MESSAGES, SUPPORTED_LANGS, useI18n, withLang, type Lang } from '../i18n'

/**
 * The site's public address. Canonical links and share cards point here,
 * whatever address the page was opened at.
 */
export const SITE_URL = 'https://joaquin-blog.uk'

/**
 * The share card's image for pages without one of their own: public/og/default.jpg.
 * Square, and under 300 KB: WhatsApp drops bigger previews. The backend
 * (app/services/seo.py) uses it too.
 */
export const DEFAULT_IMAGE = { url: `${SITE_URL}/og/default.jpg`, width: 864, height: 864 }

const OG_LOCALES: Record<Lang, string> = { en: 'en_US', es: 'es_ES' }

/** A page's public address: `pageUrl('es', '/about')` → `https://…/es/about`. */
export function pageUrl(lang: Lang, path: string): string {
  return SITE_URL + withLang(lang, path)
}

/** What a page tells search engines and share cards (WhatsApp, Instagram, X…) about itself. */
export interface PageHead {
  /** The page's title. The tab adds the site's name after it, except on the home page. */
  title: string
  description: string
  /**
   * The page's path without the language: `/`, `/about`, `/posts/x`. Pages
   * without one (search results, not found) are kept out of search engines.
   */
  path?: string
  /** Languages the page is published in, when it isn't all of them. */
  langs?: Lang[]
  /** Language of the title and description, when it isn't the page's: an untranslated post. */
  contentLang?: Lang
  /** The share card's image. DEFAULT_IMAGE when there's none. */
  image?: { url: string; alt: string }
  type?: 'website' | 'article' | 'profile'
  /** Keep a page that has a path out of search engines: a draft. */
  noindex?: boolean
  article?: { publishedTime: string; modifiedTime?: string; section?: string }
  /** The page described for search engines (structuredData.ts). */
  structuredData?: object
}

type Tag = ['meta' | 'link', Record<string, string>]

// Crawlers get the same tags from the backend (app/services/seo.py): keep the two in step.
function tagsFor(lang: Lang, head: PageHead): Tag[] {
  const langs = head.langs ?? [...SUPPORTED_LANGS]
  const textLang = head.contentLang ?? lang
  const meta = (key: string, content: string, attr = 'property'): Tag => ['meta', { [attr]: key, content }]
  const tags: Tag[] = [meta('description', head.description, 'name')]
  if (head.noindex) tags.push(meta('robots', 'noindex', 'name'))

  if (head.path !== undefined && !head.noindex) {
    const path = head.path
    const fallback = langs.includes(DEFAULT_LANG) ? DEFAULT_LANG : langs[0]
    tags.push(['link', { rel: 'canonical', href: pageUrl(langs.includes(lang) ? lang : fallback, path) }])
    if (langs.length > 1) {
      for (const l of langs) tags.push(['link', { rel: 'alternate', hreflang: l, href: pageUrl(l, path) }])
      tags.push(['link', { rel: 'alternate', hreflang: 'x-default', href: pageUrl(fallback, path) }])
    }
  }

  tags.push(
    meta('og:site_name', SITE.name),
    meta('og:type', head.type ?? 'website'),
    meta('og:title', head.title),
    meta('og:description', head.description),
  )
  if (head.path !== undefined) tags.push(meta('og:url', pageUrl(lang, head.path)))
  tags.push(meta('og:locale', OG_LOCALES[textLang]))
  for (const l of langs) {
    if (l !== textLang) tags.push(meta('og:locale:alternate', OG_LOCALES[l]))
  }

  if (head.image) {
    tags.push(meta('og:image', head.image.url), meta('og:image:alt', head.image.alt))
  } else {
    tags.push(
      meta('og:image', DEFAULT_IMAGE.url),
      meta('og:image:width', String(DEFAULT_IMAGE.width)),
      meta('og:image:height', String(DEFAULT_IMAGE.height)),
      meta('og:image:alt', MESSAGES[textLang].seo.defaultImageAlt),
    )
  }

  if (head.article) {
    tags.push(meta('article:published_time', head.article.publishedTime))
    if (head.article.modifiedTime) tags.push(meta('article:modified_time', head.article.modifiedTime))
    if (head.article.section) tags.push(meta('article:section', head.article.section))
  }

  tags.push(meta('twitter:card', head.image ? 'summary_large_image' : 'summary', 'name'))
  return tags
}

/**
 * Swaps the previous page's tags for this page's: everything in <head> marked
 * `data-seo`, index.html's defaults (or the backend's, for crawlers) included.
 * `null` leaves no tags and just the site's name, for a page still loading.
 */
export function setPageHead(lang: Lang, head: PageHead | null): void {
  for (const el of document.head.querySelectorAll('[data-seo]')) el.remove()
  document.title = !head ? SITE.name : head.path === '/' ? head.title : `${head.title} | ${SITE.name}`
  if (!head) return

  for (const [name, attrs] of tagsFor(lang, head)) {
    const el = document.createElement(name)
    for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, value)
    el.setAttribute('data-seo', '')
    document.head.append(el)
  }
  if (head.structuredData) {
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.textContent = JSON.stringify(head.structuredData)
    script.setAttribute('data-seo', '')
    document.head.append(script)
  }
}

/** Sets the page's title, description, canonical link and share card. `null` until it has its data. */
export function usePageHead(head: PageHead | null): void {
  const { lang } = useI18n()
  // `head` is a new object on every render: its JSON says whether it really changed.
  const json = JSON.stringify(head)
  useEffect(() => {
    setPageHead(lang, head)
  }, [lang, json])
}
