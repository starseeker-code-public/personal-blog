import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, POST_CATEGORIES, type PostCategory } from '../data'
import { clearAuth, isAuthenticated } from '../utils/auth'
import { useTheme } from '../context/ThemeContext'
import { IcoSun, IcoMoon } from '../components/icons'
import type { Post } from '../types'

// TODO: replace with a real upload + storage flow once image hosting is in place.
// For now every post gets the same Unsplash placeholder cover so the post page
// renders with an image. Remove this once the cover-image input ships.
const PLACEHOLDER_COVER =
  'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&q=80'

const inputClass =
  'w-full px-3 py-2 rounded-lg bg-[#faf6ee] dark:bg-[#1a1735] border border-stone-300 dark:border-[#322d5a] text-stone-900 dark:text-[#f0ecfd] placeholder:text-stone-400 dark:placeholder:text-[#8b7db8] focus:outline-none focus:border-[#798777] dark:focus:border-amber-400 transition-colors'

const labelClass =
  'block text-xs uppercase tracking-widest text-stone-500 dark:text-[#8b7db8] mb-2'

export default function AdminNewPost() {
  const navigate = useNavigate()
  const { theme, toggle } = useTheme()

  // Guard: bounce back to /login if there are no creds in sessionStorage.
  useEffect(() => {
    if (!isAuthenticated()) navigate('/login', { replace: true })
  }, [navigate])

  // ── Drafts (top section) ──────────────────────────────────────────────────
  const [drafts, setDrafts] = useState<Post[]>([])
  const [draftsLoading, setDraftsLoading] = useState(true)
  const [publishingSlug, setPublishingSlug] = useState<string | null>(null)

  async function loadDrafts() {
    setDraftsLoading(true)
    try {
      const list = await api.listDrafts()
      setDrafts(list)
    } catch {
      // Silently ignore — drafts panel just won't show anything if it fails.
    } finally {
      setDraftsLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated()) loadDrafts()
  }, [])

  function logoutToBlog() {
    clearAuth()
    navigate('/', { replace: true })
  }

  async function handlePublishDraft(slug: string) {
    setPublishingSlug(slug)
    try {
      await api.publishDraft(slug)
      logoutToBlog()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Publish failed'
      if (msg.startsWith('401')) {
        clearAuth()
        navigate('/login', { replace: true })
        return
      }
      setError(msg)
      setPublishingSlug(null)
    }
  }

  // ── New post form ─────────────────────────────────────────────────────────
  const [title, setTitle] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [category, setCategory] = useState<PostCategory | ''>('')
  const [tagsInput, setTagsInput] = useState('')
  const [body, setBody] = useState('')
  const [draft, setDraft] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    const tags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean)

    try {
      await api.createPost({
        title: title.trim(),
        excerpt: excerpt.trim(),
        body,                      // raw Markdown — stored as-is, rendered by the frontend
        category: category || undefined,
        tags,
        draft,
        coverImage: PLACEHOLDER_COVER, // TODO: replace once image upload exists
      })

      if (draft) {
        // Saved as draft — stay on the page, refresh the drafts panel,
        // and clear the form so another draft can be written.
        setTitle('')
        setExcerpt('')
        setCategory('')
        setTagsInput('')
        setBody('')
        setDraft(false)
        loadDrafts()
        setSubmitting(false)
      } else {
        // Published — log out and return to the public blog.
        logoutToBlog()
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to publish post'
      if (msg.startsWith('401')) {
        clearAuth()
        navigate('/login', { replace: true })
        return
      }
      setError(msg)
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#efead8] dark:bg-[#0f0d24] font-sans transition-colors duration-300 flex flex-col">

      {/* Minimal top bar — theme toggle only. No nav links, no sign-out
          button (publish always returns the user to the blog). */}
      <div className="flex justify-end items-center gap-3 p-4">
        <button
          onClick={toggle}
          className="p-1.5 rounded-lg text-stone-500 dark:text-[#8b7db8] hover:text-[#dd0000] dark:hover:text-amber-400 hover:bg-[rgba(221,0,0,0.09)] dark:hover:bg-[#2d2855]/60 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <IcoSun /> : <IcoMoon />}
        </button>
      </div>

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 pb-20">

        {/* ── Drafts ───────────────────────────────────────────────────────── */}
        {!draftsLoading && drafts.length > 0 && (
          <section className="mb-10">
            <h2
              className="text-xs uppercase tracking-widest text-stone-500 dark:text-[#8b7db8] mb-3"
            >
              Drafts ({drafts.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {drafts.map(d => (
                <div
                  key={d.slug}
                  className="rounded-xl border border-stone-200 dark:border-[#322d5a] bg-[#faf6ee] dark:bg-[#1a1735] p-4 flex flex-col gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-stone-900 dark:text-[#f0ecfd] font-medium text-sm truncate"
                      style={{ fontFamily: 'Capriola' }}
                      title={d.title}
                    >
                      {d.title || '(untitled)'}
                    </p>
                    {d.excerpt && (
                      <p className="text-stone-500 dark:text-[#8b7db8] text-xs mt-1 line-clamp-2">
                        {d.excerpt}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handlePublishDraft(d.slug)}
                    disabled={publishingSlug !== null}
                    className="self-end px-3 py-1.5 rounded-lg bg-[#798777] hover:bg-[#5a6b58] dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-stone-900 text-xs font-medium tracking-wide transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ fontFamily: 'Capriola' }}
                  >
                    {publishingSlug === d.slug ? 'Publishing…' : 'Publish'}
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── New post heading ─────────────────────────────────────────────── */}
        <div className="mb-10 text-center">
          <h1
            className="text-5xl text-[#395144] dark:text-[#f0ecfd] mb-2 leading-none"
            style={{ fontFamily: 'Caveat' }}
          >
            New post
          </h1>
        </div>

        {/* ── New post form ────────────────────────────────────────────────── */}
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-stone-200 dark:border-[#322d5a] bg-[#faf6ee] dark:bg-[#1a1735] p-7 space-y-6"
        >
          {/* Title */}
          <div>
            <label htmlFor="title" className={labelClass}>Title</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className={inputClass}
              required
              autoFocus
            />
          </div>

          {/* Excerpt */}
          <div>
            <label htmlFor="excerpt" className={labelClass}>
              Excerpt <span className="lowercase tracking-normal text-stone-400 dark:text-[#8b7db8]">(short summary)</span>
            </label>
            <textarea
              id="excerpt"
              rows={2}
              value={excerpt}
              onChange={e => setExcerpt(e.target.value)}
              className={`${inputClass} resize-none`}
            />
          </div>

          {/* Category dropdown + tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="category" className={labelClass}>Category</label>
              <select
                id="category"
                value={category}
                onChange={e => setCategory(e.target.value as PostCategory | '')}
                className={inputClass}
              >
                <option value="">— Select category —</option>
                {POST_CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="tags" className={labelClass}>
                Tags <span className="lowercase tracking-normal text-stone-400 dark:text-[#8b7db8]">(comma-separated)</span>
              </label>
              <input
                id="tags"
                type="text"
                value={tagsInput}
                onChange={e => setTagsInput(e.target.value)}
                className={inputClass}
                placeholder="python, fastapi"
              />
            </div>
          </div>

          {/* Body — Markdown */}
          <div>
            <label htmlFor="body" className={labelClass}>Body (Markdown)</label>
            <textarea
              id="body"
              rows={18}
              value={body}
              onChange={e => setBody(e.target.value)}
              className={`${inputClass} font-mono text-sm leading-relaxed`}
              placeholder={'# Hello\n\nWrite your post in **Markdown**.\n\n```python\nprint("hi")\n```'}
              required
            />
          </div>

          {/* TODO: cover image upload field — currently every post gets the
              same Unsplash placeholder defined at the top of this file. */}

          {/* Draft toggle */}
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={draft}
              onChange={e => setDraft(e.target.checked)}
              className="w-4 h-4 accent-[#798777] dark:accent-amber-400"
            />
            <span className="text-sm text-stone-700 dark:text-[#c9beed]">
              Save as draft (won't appear on the blog)
            </span>
          </label>

          {error && (
            <p className="text-[#dd0000] dark:text-amber-400 text-sm">
              {error}
            </p>
          )}

          {/* Submit */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting || !title || !body}
              className="px-6 py-2.5 rounded-lg bg-[#798777] hover:bg-[#5a6b58] dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-stone-900 text-sm font-medium tracking-wide transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ fontFamily: 'Capriola' }}
            >
              {submitting ? (draft ? 'Saving…' : 'Publishing…') : draft ? 'Save draft' : 'Publish post'}
            </button>
          </div>
        </form>

      </main>
    </div>
  )
}
