import type { Category, PaginatedResponse, Post, Tag } from '../types'
import { getAuth } from '../utils/auth'

export const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8000'
// Admin namespace prefix — matches the backend's SECURE_PATH env var.
export const SECURE_PATH = import.meta.env.VITE_SECURE_PATH ?? '/api/admin'

// Admin page paths — set via VITE_PATH_* env vars (gitignored .env).
// Fallbacks keep the app functional locally when env vars aren't set;
// set them in .env to any path you like for production.
export const PATH_LOGIN        = import.meta.env.VITE_PATH_LOGIN        ?? '/login'
export const PATH_ADMIN_NEW    = import.meta.env.VITE_PATH_ADMIN_NEW    ?? '/admin/new'
export const PATH_ADMIN_UPDATE = import.meta.env.VITE_PATH_ADMIN_UPDATE ?? '/admin/update'
export const PATH_ADMIN_DREAMS = import.meta.env.VITE_PATH_ADMIN_DREAMS ?? '/admin/dreams'

/** Prepend API_BASE to relative `/uploads/...` URLs; leave absolute URLs alone. */
export function resolveImageUrl(src?: string | null): string | undefined {
  if (!src) return undefined
  if (src.startsWith('http://') || src.startsWith('https://')) return src
  if (src.startsWith('/')) return `${API_BASE}${src}`
  return src
}

async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`)
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return res.json()
}

async function apiAuthGet<T>(path: string, authHeader: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Authorization: authHeader },
  })
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return res.json()
}

async function apiAuthRequest<T>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  path: string,
  body?: unknown,
): Promise<T> {
  const auth = getAuth()
  if (!auth) throw new Error('Not authenticated')
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      ...(body !== undefined && { 'Content-Type': 'application/json' }),
      Authorization: auth,
    },
    ...(body !== undefined && { body: JSON.stringify(body) }),
  })
  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`${res.status} ${res.statusText}${detail ? ` — ${detail}` : ''}`)
  }
  return res.json()
}

export const POST_CATEGORIES = ['Engineering', 'Hobbies', 'Personal Life'] as const
export type PostCategory = typeof POST_CATEGORIES[number]

export interface PostCreatePayload {
  title: string
  excerpt?: string
  body: string
  tags?: string[]
  category?: PostCategory
  draft?: boolean
  coverImage?: string
  sendToLovedOne?: boolean
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

  // ── Admin (authenticated) ─────────────────────────────────────────────────

  /** Validate Basic Auth credentials against the backend. Returns the username. */
  verifyLogin: (username: string, password: string) => {
    const header = `Basic ${btoa(`${username}:${password}`)}`
    return apiAuthGet<{ username: string }>('/api/auth/me', header)
  },

  /** Create a new post. Requires the admin Basic Auth header in sessionStorage. */
  createPost: (payload: PostCreatePayload) =>
    apiAuthRequest<Post>('POST', '/api/posts', payload),

  /** List all draft posts (admin-only). */
  listDrafts: () => apiAuthRequest<Post[]>('GET', `${SECURE_PATH}/drafts`),

  /** List every post, drafts + published, newest first (admin-only). */
  listAllPosts: () => apiAuthRequest<Post[]>('GET', `${SECURE_PATH}/posts`),

  /** Publish a draft by flipping draft=false. */
  publishDraft: (slug: string) =>
    apiAuthRequest<Post>('PUT', `/api/posts/${slug}`, { draft: false }),

  /** Update any existing post — admin-only. */
  updatePost: (slug: string, payload: Partial<PostCreatePayload>) =>
    apiAuthRequest<Post>('PUT', `/api/posts/${slug}`, payload),

  /** Upload an image; returns { url } pointing at /uploads/<filename>. */
  uploadImage: async (file: File): Promise<{ url: string }> => {
    const auth = getAuth()
    if (!auth) throw new Error('Not authenticated')
    const form = new FormData()
    form.append('file', file)
    const res = await fetch(`${API_BASE}${SECURE_PATH}/upload-image`, {
      method: 'POST',
      headers: { Authorization: auth },
      body: form,
    })
    if (!res.ok) {
      const detail = await res.text().catch(() => '')
      throw new Error(`${res.status} ${res.statusText}${detail ? ` — ${detail}` : ''}`)
    }
    return res.json()
  },
}

export const SITE = {
  name: 'Joaquín · Blog',
  tagline: 'Python, backends, and things worth writing down.',
  portfolio: 'https://joaquin-hm.com',
  author: {
    name: 'Joaquín Hernández Martínez',
    email: 'proyecto_noether@outlook.com',
    location: 'Albacete, Spain',
    bio: 'Senior Python engineer with 7+ years specializing in backend development, distributed systems, and AI-integrated workflows. Currently at Allot building cybersecurity SaaS for ISPs. Recommended by both Allot and Mercedes-Benz for professionalism and delivery. Bilingual (C2 English certified).',
  },
  social: {
    github:    'https://github.com/starseeker-code-public',
    linkedin:  'https://www.linkedin.com/in/joaquin-hernandez-martinez-91a57221a/',
    instagram: 'https://www.instagram.com/starseeker-code/',
    codewars:  'https://www.codewars.com/users/Starseeker1414',
    devto:     'https://dev.to/starseeker-code',
  },
  roles: ['Senior Backend Engineer', 'Leader and Architect', 'Fullstack Developer'],
}
