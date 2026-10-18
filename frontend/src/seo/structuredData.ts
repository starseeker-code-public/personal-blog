import { SITE } from '../data'
import { MESSAGES, type Lang } from '../i18n'
import type { Post } from '../types'
import { DEFAULT_IMAGE, SITE_URL, pageUrl } from './head'

// schema.org descriptions of the pages, for search engines' rich results.

function person(lang: Lang) {
  return {
    '@type': 'Person',
    name: SITE.author.name,
    url: pageUrl(lang, '/about'),
    image: DEFAULT_IMAGE.url,
    sameAs: [SITE.portfolio, ...Object.values(SITE.social)],
  }
}

/** The home page: the site itself. Search engines take the site's name from it. */
export function websiteData(lang: Lang, description: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: MESSAGES[lang].site.name,
    url: `${SITE_URL}/`,
    description,
    inLanguage: lang,
    author: person(lang),
  }
}

/** The About page. */
export function profileData(lang: Lang, jobTitle: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    url: pageUrl(lang, '/about'),
    inLanguage: lang,
    mainEntity: {
      ...person(lang),
      jobTitle,
      worksFor: { '@type': 'Organization', name: 'Allot', url: 'https://www.allot.com' },
    },
  }
}

/** A post, in the language it's shown in. */
export function postData(post: Post, extra: { image?: string; section?: string; keywords: string[] }) {
  const url = pageUrl(post.lang, `/posts/${post.slug}`)
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt || undefined,
    image: extra.image ? [extra.image] : undefined,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt ?? post.publishedAt,
    inLanguage: post.lang,
    url,
    mainEntityOfPage: url,
    author: person(post.lang),
    articleSection: extra.section || undefined,
    keywords: extra.keywords.length ? extra.keywords.join(', ') : undefined,
  }
}
