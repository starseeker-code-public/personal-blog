import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, POST_CATEGORIES, resolveImageUrl, type PostCategory } from '../data'
import { TAGS_BY_CATEGORY } from '../data/tags'
import { clearAuth, isAuthenticated } from '../utils/auth'
import { useTheme } from '../context/ThemeContext'
import { IcoSun, IcoMoon } from '../components/icons'
import type { Post } from '../types'

const inputClass =
  'w-full px-3 py-2 rounded-lg bg-[#faf6ee] dark:bg-[#1a1735] border border-stone-300 dark:border-[#322d5a] text-stone-900 dark:text-[#f0ecfd] placeholder:text-stone-400 dark:placeholder:text-[#8b7db8] focus:outline-none focus:border-[#dd0000] dark:focus:border-amber-400 transition-colors'

const labelClass =
  'block text-xs uppercase tracking-widest text-stone-500 dark:text-[#8b7db8] mb-2'

export default function AdminNewPost() {
  const navigate = useNavigate()
  const { theme, toggle } = useTheme()

  useEffect(() => {
    if (!isAuthenticated()) navigate('/login', { replace: true })
  }, [navigate])

  // ── Drafts panel ──────────────────────────────────────────────────────────
  const [drafts, setDrafts] = useState<Post[]>([])
  const [draftsLoading, setDraftsLoading] = useState(true)
  const [publishingSlug, setPublishingSlug] = useState<string | null>(null)

  async function loadDrafts() {
    setDraftsLoading(true)
    try {
      const list = await api.listDrafts()
      setDrafts(list)
    } catch {
      // Silent — drafts panel just stays empty on failure.
    } finally {
      setDraftsLoading(false)
    }
  }

  useEffect(() => { if (isAuthenticated()) loadDrafts() }, [])

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
      if (msg.startsWith('401')) { clearAuth(); navigate('/login', { replace: true }); return }
      setError(msg)
      setPublishingSlug(null)
    }
  }

  // ── Form state ────────────────────────────────────────────────────────────
  const [title, setTitle] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [category, setCategory] = useState<PostCategory | ''>('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [tagFilter, setTagFilter] = useState('')
  const [body, setBody] = useState('')
  const [draft, setDraft] = useState(false)
  const [sendToLovedOne, setSendToLovedOne] = useState(false)
  const [coverImage, setCoverImage] = useState<string>('')
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Reset tag selections + filter if the category changes — tags are scoped.
  useEffect(() => {
    setSelectedTags([])
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

  async function handleImageUpload(file: File) {
    setUploading(true)
    setError(null)
    try {
      const { url } = await api.uploadImage(file)
      setCoverImage(url)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Upload failed'
      if (msg.startsWith('401')) { clearAuth(); navigate('/login', { replace: true }); return }
      setError(msg)
    } finally {
      setUploading(false)
    }
  }

  function resetForm() {
    setTitle(''); setExcerpt(''); setCategory('')
    setSelectedTags([]); setTagFilter('')
    setBody(''); setDraft(false); setSendToLovedOne(false); setCoverImage('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!coverImage) {
      setError('Please upload a cover image — every post needs one.')
      return
    }

    setSubmitting(true)
    const loveTagSelected = selectedTags.includes('love')

    try {
      await api.createPost({
        title: title.trim(),
        excerpt: excerpt.trim(),
        body,
        category: category || undefined,
        tags: selectedTags,
        draft,
        coverImage,
        sendToLovedOne: loveTagSelected && sendToLovedOne,
      })

      if (draft) {
        resetForm()
        loadDrafts()
        setSubmitting(false)
      } else {
        logoutToBlog()
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to publish post'
      if (msg.startsWith('401')) { clearAuth(); navigate('/login', { replace: true }); return }
      setError(msg)
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#efead8] dark:bg-[#0f0d24] font-sans transition-colors duration-300 flex flex-col">

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
            <h2 className="text-xs uppercase tracking-widest text-stone-500 dark:text-[#8b7db8] mb-3">
              Drafts ({drafts.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {drafts.map(d => (
                <div
                  key={d.slug}
                  className="rounded-xl border border-stone-200 dark:border-[#322d5a] bg-[#faf6ee] dark:bg-[#1a1735] p-4 flex flex-col gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-stone-900 dark:text-[#f0ecfd] font-medium text-sm truncate" style={{ fontFamily: 'Capriola' }} title={d.title}>
                      {d.title || '(untitled)'}
                    </p>
                    {d.excerpt && (
                      <p className="text-stone-500 dark:text-[#8b7db8] text-xs mt-1 line-clamp-2">{d.excerpt}</p>
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
          <h1 className="text-5xl text-[#395144] dark:text-[#f0ecfd] mb-2 leading-none" style={{ fontFamily: 'Caveat' }}>
            New post
          </h1>
        </div>

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

          {/* Category + cover image — side-by-side on md+, stacked on mobile.
              Category gets 2/3 of the row; the cover-image slot gets 1/3. */}
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

          {/* Tags — category-scoped chip picker with search */}
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
                    const selected = selectedTags.includes(t)
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => toggleTag(t)}
                        className={
                          'px-2.5 py-1 rounded-full text-xs transition-colors border ' +
                          (selected
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

          {/* Body — Markdown */}
          <div>
            <label htmlFor="body" className={labelClass}>Body (Markdown)</label>
            <textarea
              id="body" rows={18} value={body}
              onChange={e => setBody(e.target.value)}
              className={`${inputClass} font-mono text-sm leading-relaxed`}
              placeholder={'# Hello\n\nWrite your post in **Markdown**.\n\n```python\nprint("hi")\n```'}
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
              Save as draft (won't appear on the blog)
            </span>
          </label>

          {/* Love-tag companion toggle — only appears when `love` is selected. */}
          {selectedTags.includes('love') && (
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox" checked={sendToLovedOne}
                onChange={e => setSendToLovedOne(e.target.checked)}
                className="w-4 h-4 accent-[#dd0000] dark:accent-amber-400"
              />
              <span className="text-sm text-stone-700 dark:text-[#c9beed]" style={{ fontFamily: 'Caveat', fontSize: '1.125rem' }}>
                send email to loved one
              </span>
            </label>
          )}

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
              {submitting ? (draft ? 'Saving…' : 'Publishing…') : draft ? 'Save draft' : 'Publish post'}
            </button>
          </div>
        </form>

      </main>
    </div>
  )
}
