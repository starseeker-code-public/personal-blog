import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api, POST_CATEGORIES, resolveImageUrl, type PostCategory, PATH_ADMIN_UPDATE, PATH_ADMIN_DREAMS, PATH_ADMIN_INFO, PATH_LOGIN } from '../data'
import { TAGS_BY_CATEGORY } from '../data/tags'
import { POST_TEMPLATE_GROUPS, type PostTemplate } from '../templates'
import { clearAuth, isAuthenticated } from '../utils/auth'
import { useTheme } from '../context/ThemeContext'
import { IcoSun, IcoMoon, IcoPencil, IcoDreams, IcoChart } from '../components/icons'
import { ContentLangBadges, ContentLangToggle, CONTENT_LANG_LABELS } from '../components/i18n/ContentLangToggle'
import {
  DEFAULT_LANG, EMPTY_CONTENT, MESSAGES,
  adminContent, contentStatus, missingTranslationWarning,
  type ContentStatus, type Lang, type PostContent,
} from '../i18n'
import type { AdminPost } from '../types'

const inputClass =
  'w-full px-3 py-2 rounded-lg bg-[#faf6ee] dark:bg-[#1a1735] border border-stone-300 dark:border-[#322d5a] text-stone-900 dark:text-[#f0ecfd] placeholder:text-stone-400 dark:placeholder:text-[#8b7db8] focus:outline-none focus:border-[#dd0000] dark:focus:border-amber-400 transition-colors'

const labelTextClass =
  'block text-xs uppercase tracking-widest text-stone-500 dark:text-[#8b7db8]'

const labelClass = `${labelTextClass} mb-2`

const BODY_PLACEHOLDER: Record<Lang, string> = {
  en: '# Hello\n\nWrite your post in **Markdown**.\n\n```python\nprint("hi")\n```',
  es: '# Hola\n\nEscribe la versión en español en **Markdown**.\n\n```python\nprint("hola")\n```',
}

export default function AdminNewPost() {
  const navigate = useNavigate()
  const { theme, toggle } = useTheme()

  useEffect(() => {
    if (!isAuthenticated()) navigate(PATH_LOGIN || '/', { replace: true })
  }, [navigate])

  // ── Drafts panel ──────────────────────────────────────────────────────────
  const [drafts, setDrafts] = useState<AdminPost[]>([])
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

  async function handlePublishDraft(d: AdminPost) {
    const warning = missingTranslationWarning('es', contentStatus(adminContent(d).es))
    if (warning && !window.confirm(warning)) return
    setPublishingSlug(d.slug)
    try {
      await api.publishDraft(d.slug)
      logoutToBlog()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Publish failed'
      if (msg.startsWith('401')) { clearAuth(); navigate(PATH_LOGIN, { replace: true }); return }
      setError(msg)
      setPublishingSlug(null)
    }
  }

  // ── Form state ────────────────────────────────────────────────────────────
  // Title, excerpt and body are kept per language as you type; the ENG / ESP
  // toggle picks which one the fields show. Everything else is shared.
  const [content, setContent] = useState<Record<Lang, PostContent>>({ en: EMPTY_CONTENT, es: EMPTY_CONTENT })
  const [editLang, setEditLang] = useState<Lang>(DEFAULT_LANG)
  const { title, excerpt, body } = content[editLang]
  const [category, setCategory] = useState<PostCategory | ''>('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [tagFilter, setTagFilter] = useState('')
  const [draft, setDraft] = useState(false)
  const [sendToLovedOne, setSendToLovedOne] = useState(false)
  const [coverImage, setCoverImage] = useState<string>('')
  const [template, setTemplate] = useState<PostTemplate | null>(null)
  const [templateMenuOpen, setTemplateMenuOpen] = useState(false)
  const templateMenuRef = useRef<HTMLDivElement>(null)
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const status: Record<Lang, ContentStatus> = {
    en: contentStatus(content.en),
    es: contentStatus(content.es),
  }

  function setField(field: keyof PostContent, value: string) {
    setContent(prev => ({ ...prev, [editLang]: { ...prev[editLang], [field]: value } }))
  }

  // Reset tag selections + filter if the category changes — tags are scoped.
  useEffect(() => {
    setSelectedTags([])
    setTagFilter('')
  }, [category])

  // Close the template menu on outside click or Escape.
  useEffect(() => {
    if (!templateMenuOpen) return
    function onPointerDown(e: MouseEvent) {
      if (!templateMenuRef.current?.contains(e.target as Node)) setTemplateMenuOpen(false)
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setTemplateMenuOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [templateMenuOpen])

  const highlightedTags = useMemo(() => new Set(template?.tags ?? []), [template])

  // Template-suggested tags float to the front so they're visible without scrolling.
  const availableTags = useMemo(() => {
    if (!category) return []
    const all = TAGS_BY_CATEGORY[category]
    const q = tagFilter.trim().toLowerCase()
    const filtered = q ? all.filter(t => t.toLowerCase().includes(q)) : all
    return [
      ...filtered.filter(t => highlightedTags.has(t)),
      ...filtered.filter(t => !highlightedTags.has(t)),
    ]
  }, [category, tagFilter, highlightedTags])

  function applyTemplate(t: PostTemplate) {
    setTemplateMenuOpen(false)
    if (!t.body) return
    const language = MESSAGES.en.languages[editLang]
    if (body.trim() && body !== t.body && !window.confirm(`Replace the ${language} body with the "${t.label}" template?`)) return
    setTemplate(t)
    setCategory(t.category)
    setField('body', t.body)
  }

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
      if (msg.startsWith('401')) { clearAuth(); navigate(PATH_LOGIN, { replace: true }); return }
      setError(msg)
    } finally {
      setUploading(false)
    }
  }

  function resetForm() {
    setContent({ en: EMPTY_CONTENT, es: EMPTY_CONTENT }); setEditLang(DEFAULT_LANG)
    setCategory(''); setTemplate(null)
    setSelectedTags([]); setTagFilter('')
    setDraft(false); setSendToLovedOne(false); setCoverImage('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!coverImage) {
      setError('Please upload a cover image — every post needs one.')
      return
    }

    // Drafts are work in progress; only ask once the post goes live.
    const warning = draft ? null : missingTranslationWarning('es', status.es)
    if (warning && !window.confirm(warning)) {
      setEditLang('es')
      return
    }

    setSubmitting(true)
    const loveTagSelected = selectedTags.includes('love')
    const { en, es } = content

    try {
      await api.createPost({
        title: en.title.trim(),
        excerpt: en.excerpt.trim(),
        body: en.body,
        titleEs: es.title.trim(),
        excerptEs: es.excerpt.trim(),
        bodyEs: es.body,
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
      if (msg.startsWith('401')) { clearAuth(); navigate(PATH_LOGIN, { replace: true }); return }
      setError(msg)
      setSubmitting(false)
    }
  }

  // What still blocks saving. English is the primary language, so it's required.
  const missing = [
    !content.en.title.trim() && 'English title',
    !content.en.body.trim() && 'English body',
    !coverImage && 'cover image',
  ].filter((x): x is string => Boolean(x))

  // Marks the fields that belong to the language being edited.
  const langMark = <span className="text-[#b72007] dark:text-amber-300">· {CONTENT_LANG_LABELS[editLang]}</span>

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
          to={PATH_ADMIN_INFO}
          className="p-1.5 rounded-lg text-stone-500 dark:text-[#8b7db8] hover:text-[#dd0000] dark:hover:text-amber-400 hover:bg-[rgba(221,0,0,0.09)] dark:hover:bg-[#2d2855]/60 transition-colors"
          aria-label="Goals & analytics"
          title="Goals & analytics"
        >
          <IcoChart />
        </Link>
        <Link
          to={PATH_ADMIN_UPDATE}
          className="p-1.5 rounded-lg text-stone-500 dark:text-[#8b7db8] hover:text-[#dd0000] dark:hover:text-amber-400 hover:bg-[rgba(221,0,0,0.09)] dark:hover:bg-[#2d2855]/60 transition-colors"
          aria-label="Edit an existing post"
          title="Edit an existing post"
        >
          <IcoPencil />
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
                    <p className="text-stone-900 dark:text-[#f0ecfd] font-medium text-sm truncate" style={{ fontFamily: 'Capriola' }} title={d.title || d.titleEs}>
                      {d.title || d.titleEs || '(untitled)'}
                    </p>
                    {(d.excerpt || d.excerptEs) && (
                      <p className="text-stone-500 dark:text-[#8b7db8] text-xs mt-1 line-clamp-2">{d.excerpt || d.excerptEs}</p>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <ContentLangBadges content={adminContent(d)} />
                    <button
                      onClick={() => handlePublishDraft(d)}
                      disabled={publishingSlug !== null}
                      className="px-3 py-1.5 rounded-lg bg-[#798777] hover:bg-[#5a6b58] dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-stone-900 text-xs font-medium tracking-wide transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ fontFamily: 'Capriola' }}
                    >
                      {publishingSlug === d.slug ? 'Publishing…' : 'Publish'}
                    </button>
                  </div>
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
          {/* Language — title, excerpt and body are written once per language */}
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 pb-6 border-b border-stone-200 dark:border-[#322d5a]">
            <ContentLangToggle value={editLang} onChange={setEditLang} status={status} />
            <p className="text-stone-500 dark:text-[#8b7db8] text-xs">
              Title, excerpt and body are saved per language as you type. The rest is shared.
            </p>
          </div>

          {/* Title */}
          <div>
            <label htmlFor="title" className={labelClass}>Title {langMark}</label>
            <input
              id="title" type="text" value={title} lang={editLang}
              onChange={e => setField('title', e.target.value)}
              placeholder={editLang === DEFAULT_LANG ? undefined : content[DEFAULT_LANG].title}
              className={inputClass} autoFocus
            />
          </div>

          {/* Excerpt */}
          <div>
            <label htmlFor="excerpt" className={labelClass}>
              Excerpt {langMark} <span className="lowercase tracking-normal text-stone-400 dark:text-[#8b7db8]">(short summary)</span>
            </label>
            <textarea
              id="excerpt" rows={2} value={excerpt} lang={editLang}
              onChange={e => setField('excerpt', e.target.value)}
              placeholder={editLang === DEFAULT_LANG ? undefined : content[DEFAULT_LANG].excerpt}
              className={`${inputClass} resize-none`}
            />
          </div>

          {/* Category + template + cover image — side-by-side on md+, stacked on mobile.
              Category gets half of the row; template and cover image a quarter each. */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:items-end">
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
            <div className="md:col-span-1 relative" ref={templateMenuRef}>
              <label className={labelClass}>Template</label>
              <button
                type="button"
                onClick={() => setTemplateMenuOpen(o => !o)}
                aria-haspopup="menu"
                aria-expanded={templateMenuOpen}
                title={template ? template.label : 'Apply a post template'}
                className="w-full truncate text-left px-3 py-2 rounded-lg border border-stone-300 dark:border-[#322d5a] bg-[#efead8] dark:bg-[#0f0d24] text-xs text-stone-700 dark:text-[#c9beed] hover:border-[#dd0000] dark:hover:border-amber-400 transition-colors"
              >
                {template ? template.label : 'Choose'}
              </button>
              {templateMenuOpen && (
                <div
                  role="menu"
                  className="absolute z-20 left-0 mt-1 w-64 max-h-80 overflow-y-auto rounded-lg border border-stone-300 dark:border-[#322d5a] bg-[#faf6ee] dark:bg-[#1a1735] shadow-lg py-1"
                >
                  {POST_TEMPLATE_GROUPS.map(g => (
                    <div key={g.label} className="py-1">
                      <p className="px-3 pt-1 pb-0.5 text-[10px] uppercase tracking-widest text-stone-400 dark:text-[#8b7db8]">
                        {g.label}
                      </p>
                      {g.templates.map(t => (
                        <button
                          key={t.id}
                          type="button"
                          role="menuitem"
                          disabled={!t.body}
                          onClick={() => applyTemplate(t)}
                          className={
                            'w-full text-left px-3 py-1 text-xs flex items-center justify-between gap-2 transition-colors ' +
                            (t.body
                              ? 'text-stone-700 dark:text-[#c9beed] hover:bg-[rgba(221,0,0,0.09)] dark:hover:bg-[#2d2855]/60'
                              : 'text-stone-400 dark:text-[#5f5690] cursor-not-allowed') +
                            (template?.id === t.id ? ' font-semibold' : '')
                          }
                        >
                          <span className="truncate">{t.label}</span>
                          {!t.body && <span className="shrink-0 text-[10px] italic">soon</span>}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              )}
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
                <div className="flex flex-wrap gap-2 max-h-80 overflow-y-auto pr-1">
                  {availableTags.map(t => {
                    const selected = selectedTags.includes(t)
                    const highlighted = !selected && highlightedTags.has(t)
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => toggleTag(t)}
                        className={
                          'px-2.5 py-1 rounded-full text-xs transition-colors border ' +
                          (selected
                            ? 'bg-[#798777] dark:bg-amber-500 text-white dark:text-stone-900 border-[#798777] dark:border-amber-500'
                            : highlighted
                            ? 'bg-[#c829040d] dark:bg-amber-500/10 text-[#b72007] dark:text-amber-300 border-dashed border-[#c82904] dark:border-amber-400 hover:bg-[#c829041a] dark:hover:bg-amber-500/20'
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
                {(selectedTags.length > 0 || template) && (
                  <p className="text-stone-500 dark:text-[#8b7db8] text-xs mt-2">
                    {selectedTags.length > 0 && `${selectedTags.length} selected`}
                    {selectedTags.length > 0 && template && ' · '}
                    {template && `dashed tags are suggested by the ${template.label} template`}
                  </p>
                )}
              </>
            )}
          </div>

          {/* Body — Markdown, per language */}
          <div>
            <div className="flex items-end justify-between gap-3 mb-2">
              <label htmlFor="body" className={labelTextClass}>Body (Markdown) {langMark}</label>
              <ContentLangToggle value={editLang} onChange={setEditLang} status={status} />
            </div>
            <textarea
              id="body" rows={18} value={body} lang={editLang}
              onChange={e => setField('body', e.target.value)}
              className={`${inputClass} font-mono text-sm leading-relaxed`}
              placeholder={BODY_PLACEHOLDER[editLang]}
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
              <span className="text-sm text-stone-700 dark:text-[#c9beed]">
                send email to loved one
              </span>
            </label>
          )}

          {error && <p className="text-[#dd0000] dark:text-amber-400 text-sm">{error}</p>}

          <div className="flex items-center justify-end gap-4">
            <div className="space-y-1 text-right">
              {missing.length > 0 && (
                <p className="text-stone-500 dark:text-[#8b7db8] text-xs italic">
                  Still needed: {missing.join(', ')}
                </p>
              )}
              {selectedTags.length > 5 && (
                <p className="text-[#dd0000] dark:text-orange-400 text-xs italic">
                  * more than 5 tags selected ({selectedTags.length}) — the blog listings will collapse the extras behind a "…" chip
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={submitting || missing.length > 0}
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
