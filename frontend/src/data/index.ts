import type { Category, PaginatedResponse, Post, Tag } from '../types'

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8000'

async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`)
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return res.json()
}

export const api = {
  listPosts: (
    page = 1,
    pageSize = 10,
    options: { tag?: string; category?: string } = {},
  ) => {
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
    if (options.tag) params.set('tag', options.tag)
    if (options.category) params.set('category', options.category)
    return apiGet<PaginatedResponse<Post>>(`/api/posts?${params}`)
  },

  getPost: (slug: string) => apiGet<Post>(`/api/posts/${slug}`),

  listCategories: () => apiGet<Category[]>('/api/categories'),

  listTags: () => apiGet<Tag[]>('/api/tags'),

  search: (q: string, limit = 20) =>
    apiGet<Post[]>(`/api/search?q=${encodeURIComponent(q)}&limit=${limit}`),
}

export const SITE = {
  name: 'Joaquín · Blog',
  tagline: 'Python, backends, and things worth writing down.',
  author: {
    name: 'Joaquín Hernández Martínez',
    email: 'proyecto_noether@outlook.com',
  },
  social: {
    github: 'https://github.com/starseeker-code-public',
    linkedin: 'https://www.linkedin.com/in/joaquin-hernandez',
  },
  roles: ['Python Engineer', 'Backend Developer', 'Open Source Enthusiast', 'Technical Writer'],
}
