export interface Author {
  name: string
  avatar?: string
  bio?: string
  socials?: Partial<Record<'github' | 'linkedin' | 'twitter' | 'email', string>>
}

export interface Post {
  slug: string
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
