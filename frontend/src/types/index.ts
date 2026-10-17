import type { Lang } from '../i18n/config'

export interface Author {
  name: string
  avatar?: string
  bio?: string
  socials?: Partial<Record<'github' | 'linkedin' | 'twitter' | 'email', string>>
}

export interface Post {
  slug: string
  /** Language of title, excerpt and body: the one asked for, or English when the post has no translation. */
  lang: Lang
  /** Languages the post is written in, English first. */
  availableLangs: Lang[]
  title: string
  excerpt: string
  body: string
  publishedAt: string   // ISO 8601
  updatedAt?: string
  readTimeMinutes: number
  coverImage?: string
  draft?: boolean
  tags: string[]
  category: string
  author?: Author
}

/** A post as the admin endpoints return it: the English fields plus the Spanish translation. */
export interface AdminPost extends Post {
  titleEs: string
  excerptEs: string
  bodyEs: string
  /** A love letter is waiting for the post to be published. */
  sendToLovedOne: boolean
  /** When the love letter last went out. */
  loveLetterSentAt?: string
}

export interface Category {
  id: number
  slug: string
  name: string
  description?: string
  postCount: number
}

export interface Tag {
  id: number
  slug: string
  name: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}
