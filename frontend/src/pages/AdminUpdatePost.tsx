import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api, POST_CATEGORIES, resolveImageUrl, type PostCategory, PATH_ADMIN_NEW, PATH_ADMIN_DREAMS, PATH_LOGIN } from '../data'
import { TAGS_BY_CATEGORY } from '../data/tags'
import { clearAuth, isAuthenticated } from '../utils/auth'
import { useTheme } from '../context/ThemeContext'
import { IcoSun, IcoMoon, IcoPlus, IcoSearch, IcoArrowLeft, IcoDreams } from '../components/icons'
import type { Post } from '../types'

const inputClass =
  'w-full px-3 py-2 rounded-lg bg-[#faf6ee] dark:bg-[#1a1735] border border-stone-300 dark:border-[#322d5a] text-stone-900 dark:text-[#f0ecfd] placeholder:text-stone-400 dark:placeholder:text-[#8b7db8] focus:outline-none focus:border-[#dd0000] dark:focus:border-amber-400 transition-colors'

const labelClass =
  'block text-xs uppercase tracking-widest text-stone-500 dark:text-[#8b7db8] mb-2'

/**
 * Admin edit flow — pick a post by title, then edit every field.
 * On save: log out and return to the blog home.
 */
export default function AdminUpdatePost() {
  const navigate = useNavigate()
  const { theme, toggle } = useTheme()

  useEffect(() => {
    if (!isAuthenticated()) navigate(PATH_LOGIN || '/', { replace: true })
  }, [navigate])

  // ── Post picker ────────────────────────────────────────────────────────────
  const [posts, setPosts] = useState<Post[]>([])
  const [loadingPosts, setLoadingPosts] = useState(true)
  const [titleQuery, setTitleQuery] = useState('')
  const [selected, setSelected] = useState<Post | null>(null)

  useEffect(() => {
    if (!isAuthenticated()) return
    setLoadingPosts(true)
    api.listAllPosts()
      .then(setPosts)
      .catch(() => setPosts([]))
      .finally(() => setLoadingPosts(false))
  }, [])

  const matches = useMemo(() => {
    const q = titleQuery.trim().toLowerCase()
    if (!q) return posts
    return posts.filter(p => p.title.toLowerCase().includes(q))
  }, [posts, titleQuery])

  // ── Form state ─────────────────────────────────────────────────────────────
  const [title, setTitle] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [category, setCategory] = useState<PostCategory | ''>('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [tagFilter, setTagFilter] = useState('')
  const [body, setBody] = useState('')
  const [draft, setDraft] = useState(false)
  const [coverImage, setCoverImage] = useState<string>('')
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function hydrateForm(p: Post) {
    setTitle(p.title)
    setExcerpt(p.excerpt)
    // Category from the wire may be an empty string for the "uncategorised" row.
    const asCategory = POST_CATEGORIES.find(c => c === p.category) as PostCategory | undefined
    setCategory(asCategory ?? '')
    setSelectedTags(p.tags ?? [])
    setTagFilter('')
    setBody(p.body)
    setDraft(Boolean(p.draft))
    setCoverImage(p.coverImage ?? '')
    setError(null)
  }

  function pickPost(p: Post) {
    setSelected(p)
    hydrateForm(p)
  }

  function backToList() {
    setSelected(null)
    setError(null)
  }

  useEffect(() => {
    // Clear selected tag filter when the category changes, but keep the
    // already-picked tags even if some belong to another category — we
    // don't want to quietly drop tags on edit.
    setTagFilter('')
  }, [category])

  const availableTags = useMemo(() => {
    if (!category) return []
    const all = TAGS_BY_CATEGORY[category]
    const q = tagFilter.trim().toLowerCase()
    return q ? all.filter(t => t.toLowerCase().includes(q)) : all
  }, [category, tagFilter])

  function toggleTag(t: string) {
    setSelectedTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])
  }

  function logoutToBlog() {
    clearAuth()
    navigate('/', { replace: true })
  }

  async function handleImageUpload(file: File) {
    setUploading(true)
    setError(null)
    try {
      const { url } = await api.uploadImage(file)
      setCoverImage(url)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Upload failed'
      if (msg.startsWith('401')) { clearAuth(); navigate(PATH_LOGIN, { replace: true }); return }
      setError(msg)
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selected) return
    setError(null)

    if (!coverImage) {
      setError('Every post needs a cover image.')
      return
    }

    setSubmitting(true)
    try {
      await api.updatePost(selected.slug, {
        title: title.trim(),
        excerpt: excerpt.trim(),
        body,
        category: category || undefined,
        tags: selectedTags,
        draft,
        coverImage,
      })
      logoutToBlog()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Update failed'
      if (msg.startsWith('401')) { clearAuth(); navigate(PATH_LOGIN, { replace: true }); return }
      setError(msg)
      setSubmitting(false)
    }
  }

  if (!isAuthenticated()) return null

  return (
    <div className="min-h-screen bg-[#efead8] dark:bg-[#0f0d24] font-sans transition-colors duration-300 flex flex-col">

      <div className="flex justify-end items-center gap-3 p-4">
        <Link
          to={PATH_ADMIN_DREAMS}
          className="p-1.5 rounded-lg text-stone-500 dark:text-[#8b7db8] hover:text-[#dd0000] dark:hover:text-amber-400 hover:bg-[rgba(221,0,0,0.09)] dark:hover:bg-[#2d2855]/60 transition-colors"
          aria-label="Dreams"
          title="Dreams"
        >
          <IcoDreams />
        </Link>
        <Link
          to={PATH_ADMIN_NEW}
          className="p-1.5 rounded-lg text-stone-500 dark:text-[#8b7db8] hover:text-[#dd0000] dark:hover:text-amber-400 hover:bg-[rgba(221,0,0,0.09)] dark:hover:bg-[#2d2855]/60 transition-colors"
          aria-label="New post"
          title="New post"
        >
          <IcoPlus />
        </Link>
        <button
          onClick={toggle}
          className="p-1.5 rounded-lg text-stone-500 dark:text-[#8b7db8] hover:text-[#dd0000] dark:hover:text-amber-400 hover:bg-[rgba(221,0,0,0.09)] dark:hover:bg-[#2d2855]/60 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <IcoSun /> : <IcoMoon />}
        </button>
      </div>

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 pb-20">

        <div className="mb-10 text-center">
          <h1 className="text-5xl text-[#395144] dark:text-[#f0ecfd] mb-2 leading-none" style={{ fontFamily: 'Caveat' }}>
            {selected ? 'Edit post' : 'Pick a post to edit'}
          </h1>
        </div>

        {/* ── Picker mode ─────────────────────────────────────────────────── */}
        {!selected && (
          <div className="space-y-6">
            <div className="relative">
              <span className="absolute left-3 inset-y-0 flex items-center text-stone-500 dark:text-[#8b7db8] pointer-events-none">
                <IcoSearch />
              </span>
              <input
                type="search"
                autoFocus
                placeholder="Search posts by title…"
                value={titleQuery}
                onChange={e => setTitleQuery(e.target.value)}
                className={`${inputClass} pl-10`}
              />
            </div>

            {loadingPosts ? (
              <p className="text-stone-500 dark:text-[#8b7db8] text-sm italic text-center py-10">Loading…</p>
            ) : matches.length === 0 ? (
              <p className="text-stone-500 dark:text-[#8b7db8] text-sm italic text-center py-10">
                {posts.length === 0 ? 'No posts yet.' : 'No posts match that title.'}
              </p>
            ) : (
              <ul className="space-y-2">
                {matches.map(p => (
                  <li key={p.slug}>
                    <button
                      type="button"
                      onClick={() => pickPost(p)}
                      className="w-full text-left rounded-xl border border-stone-200 dark:border-[#322d5a] bg-[#faf6ee] dark:bg-[#1a1735] px-4 py-3 hover:border-[#dd0000] dark:hover:border-amber-400 transition-colors flex items-center gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-stone-900 dark:text-[#f0ecfd] font-medium text-sm truncate" style={{ fontFamily: 'Capriola' }}>
                          {p.title || '(untitled)'}
                        </p>
                        <p className="text-stone-500 dark:text-[#8b7db8] text-xs mt-0.5">
                          {p.category || 'uncategorised'}
                          {p.draft && <span className="ml-2 text-[#dd0000] dark:text-amber-400">· draft</span>}
                        </p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* ── Edit mode ───────────────────────────────────────────────────── */}
        {selected && (
          <>
            <button
              type="button"
              onClick={backToList}
              className="inline-flex items-center gap-2 text-stone-500 dark:text-[#8b7db8] hover:text-stone-700 dark:hover:text-[#c9beed] text-sm mb-6 transition-colors"
            >
              <IcoArrowLeft />
              Back to post list
            </button>

            <form
              onSubmit={handleSubmit}
              className="rounded-xl border border-stone-200 dark:border-[#322d5a] bg-[#faf6ee] dark:bg-[#1a1735] p-7 space-y-6"
            >
              {/* Title */}
              <div>
                <label htmlFor="title" className={labelClass}>Title</label>
                <input
                  id="title" type="text" value={title}
                  onChange={e => setTitle(e.target.value)}
                  className={inputClass} required autoFocus
                />
              </div>

              {/* Excerpt */}
              <div>
                <label htmlFor="excerpt" className={labelClass}>
                  Excerpt <span className="lowercase tracking-normal text-stone-400 dark:text-[#8b7db8]">(short summary)</span>
                </label>
                <textarea
                  id="excerpt" rows={2} value={excerpt}
                  onChange={e => setExcerpt(e.target.value)}
                  className={`${inputClass} resize-none`}
                />
              </div>

              {/* Category + cover image */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:items-end">
                <div className="md:col-span-2">
                  <label htmlFor="category" className={labelClass}>Category</label>
                  <select
                    id="category" value={category}
                    onChange={e => setCategory(e.target.value as PostCategory | '')}
                    className={inputClass}
                  >
                    <option value="">— Select category —</option>
                    {POST_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="md:col-span-1">
                  <label className={labelClass}>Cover image</label>
                  <div className="flex items-center gap-3">
                    <label className="shrink-0 cursor-pointer px-3 py-2 rounded-lg border border-stone-300 dark:border-[#322d5a] bg-[#efead8] dark:bg-[#0f0d24] text-xs text-stone-700 dark:text-[#c9beed] hover:border-[#dd0000] dark:hover:border-amber-400 transition-colors">
                      {uploading ? 'Uploading…' : coverImage ? 'Replace' : 'Choose'}
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/gif"
                        className="hidden"
                        disabled={uploading}
                        onChange={e => {
                          const f = e.target.files?.[0]
                          if (f) handleImageUpload(f)
                          e.target.value = ''
                        }}
                      />
                    </label>
                    {coverImage && (
                      <img
                        src={resolveImageUrl(coverImage)}
                        alt="Cover preview"
                        className="w-12 h-12 object-cover rounded-lg border border-stone-200 dark:border-[#322d5a]"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label htmlFor="tag-filter" className={labelClass}>Tags</label>
                {!category ? (
                  <p className="text-stone-500 dark:text-[#8b7db8] text-xs italic">
                    Select a category to see its tags.
                  </p>
                ) : (
                  <>
                    <input
                      id="tag-filter"
                      type="search"
                      placeholder="Filter tags…"
                      value={tagFilter}
                      onChange={e => setTagFilter(e.target.value)}
                      className={`${inputClass} mb-3`}
                    />
                    <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-1">
                      {availableTags.map(t => {
                        const isSel = selectedTags.includes(t)
                        return (
                          <button
                            key={t}
                            type="button"
                            onClick={() => toggleTag(t)}
                            className={
                              'px-2.5 py-1 rounded-full text-xs transition-colors border ' +
                              (isSel
                                ? 'bg-[#798777] dark:bg-amber-500 text-white dark:text-stone-900 border-[#798777] dark:border-amber-500'
                                : 'bg-[#efead8] dark:bg-[#0f0d24] text-stone-600 dark:text-[#c9beed] border-stone-300 dark:border-[#322d5a] hover:border-[#798777] dark:hover:border-amber-400')
                            }
                          >
                            {t}
                          </button>
                        )
                      })}
                      {availableTags.length === 0 && (
                        <p className="text-stone-500 dark:text-[#8b7db8] text-xs italic py-1">No tags match that filter.</p>
                      )}
                    </div>
                    {selectedTags.length > 0 && (
                      <p className="text-stone-500 dark:text-[#8b7db8] text-xs mt-2">
                        {selectedTags.length} selected
                      </p>
                    )}
                  </>
                )}
              </div>

              {/* Body */}
              <div>
                <label htmlFor="body" className={labelClass}>Body (Markdown)</label>
                <textarea
                  id="body" rows={18} value={body}
                  onChange={e => setBody(e.target.value)}
                  className={`${inputClass} font-mono text-sm leading-relaxed`}
                  required
                />
              </div>

              {/* Draft toggle */}
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox" checked={draft}
                  onChange={e => setDraft(e.target.checked)}
                  className="w-4 h-4 accent-[#798777] dark:accent-amber-400"
                />
                <span className="text-sm text-stone-700 dark:text-[#c9beed]">
                  Keep as draft (won't appear on the blog)
                </span>
              </label>

              {error && <p className="text-[#dd0000] dark:text-amber-400 text-sm">{error}</p>}

              <div className="flex items-center justify-end gap-4">
                {selectedTags.length > 5 && (
                  <p className="text-[#dd0000] dark:text-orange-400 text-xs italic text-right">
                    * more than 5 tags selected ({selectedTags.length}) — the blog listings will collapse the extras behind a "…" chip
                  </p>
                )}
                <button
                  type="submit"
                  disabled={submitting || !title || !body || !coverImage}
                  className="shrink-0 px-6 py-2.5 rounded-lg bg-[#798777] hover:bg-[#5a6b58] dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-stone-900 text-sm font-medium tracking-wide transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ fontFamily: 'Capriola' }}
                >
                  {submitting ? 'Saving…' : 'Save changes'}
                </button>
              </div>
            </form>
          </>
        )}

      </main>
    </div>
  )
}
