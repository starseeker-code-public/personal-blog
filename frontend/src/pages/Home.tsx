import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Category, PaginatedResponse, Post } from '../types'
import { api, SITE } from '../data'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import { Stars, PostCard, Pagination } from '../components/ui'
import { IcoSearch } from '../components/icons'

// Rotates "Personal Blog" → "Visit my portfolio" (blinking) for ~60s → back permanently
function HeaderBadge() {
  const [phase, setPhase] = useState<'blog' | 'portfolio' | 'done'>('blog')

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('portfolio'), 5_000)
    const t2 = setTimeout(() => setPhase('done'), 65_000)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  if (phase === 'portfolio') {
    return (
      <a
        href={SITE.portfolio}
        target="_blank"
        rel="noopener noreferrer"
        className="text-violet-400 text-xs tracking-[0.3em] uppercase mb-3 inline-block animate-pulse hover:text-violet-300 transition-colors"
      >
        Visit my portfolio →
      </a>
    )
  }

  return (
    <p className="text-violet-400 text-xs tracking-[0.3em] uppercase mb-3">Personal Blog</p>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [data, setData] = useState<PaginatedResponse<Post> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.listCategories().then(setCategories).catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    api.listPosts(page, 8, { category: activeCategory ?? undefined })
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [page, activeCategory])

  const handleCategoryChange = (slug: string | null) => {
    setActiveCategory(slug)
    setPage(1)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const activeCategoryName = categories.find(c => c.slug === activeCategory)?.name

  return (
    <div className="min-h-screen bg-slate-950 font-sans">
      <Stars />
      <Navbar />

      <div className="relative z-10 max-w-2xl mx-auto px-4 pt-28 pb-16">

        {/* ── Blog header ─────────────────────────────────────── */}
        <header className="text-center mb-10">
          <HeaderBadge />
          <h1 className="text-5xl sm:text-6xl text-white mb-3 font-caveat leading-none">
            {SITE.name}
          </h1>
          <p className="text-slate-500 text-sm">{SITE.tagline}</p>
        </header>

        {/* ── Search bar ──────────────────────────────────────── */}
        <form onSubmit={handleSearch} className="relative mb-10 group">
          <span className="absolute left-4 inset-y-0 flex items-center pointer-events-none text-slate-500 group-focus-within:text-violet-400 transition-colors">
            <IcoSearch />
          </span>
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search posts by title, topic, or keyword…"
            className="w-full pl-11 pr-20 py-3.5 bg-slate-900/60 border border-white/10 rounded-xl text-white text-sm placeholder:text-slate-600 outline-none focus:border-violet-500/70 focus:bg-slate-900/90 transition-colors"
          />
          <button
            type="submit"
            className={`absolute right-2.5 inset-y-0 my-auto h-8 px-3.5 rounded-lg text-xs font-medium transition-all ${
              searchQuery.trim()
                ? 'bg-violet-600 hover:bg-violet-500 text-white opacity-100'
                : 'bg-slate-800 text-slate-600 opacity-0 pointer-events-none'
            }`}
          >
            Search
          </button>
        </form>

        {/* ── Category filter pills ───────────────────────────── */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <button
              onClick={() => handleCategoryChange(null)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                activeCategory === null
                  ? 'bg-violet-600 border-violet-500 text-white'
                  : 'border-white/10 text-slate-400 hover:text-white hover:border-white/25 bg-transparent'
              }`}
            >
              All posts
            </button>
            {categories.map(c => (
              <button
                key={c.slug}
                onClick={() => handleCategoryChange(c.slug)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                  activeCategory === c.slug
                    ? 'bg-violet-600 border-violet-500 text-white'
                    : 'border-white/10 text-slate-400 hover:text-white hover:border-white/25 bg-transparent'
                }`}
              >
                {c.name}
                <span className={`ml-1.5 text-[11px] ${activeCategory === c.slug ? 'text-violet-300' : 'text-slate-600'}`}>
                  {c.postCount}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* ── Post count ──────────────────────────────────────── */}
        {!loading && data && (
          <p className="text-slate-600 text-xs mb-2">
            {data.total} {data.total === 1 ? 'post' : 'posts'}
            {activeCategoryName ? ` in ${activeCategoryName}` : ''}
          </p>
        )}

        {/* ── Post list ───────────────────────────────────────── */}
        {loading ? (
          <div className="divide-y divide-white/5">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="py-8 space-y-3 animate-pulse">
                <div className="h-3 bg-slate-800/60 rounded w-1/4" />
                <div className="h-6 bg-slate-800/60 rounded w-3/4" />
                <div className="h-4 bg-slate-800/60 rounded w-full" />
                <div className="h-4 bg-slate-800/60 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : data?.items.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-500 text-sm">
              {activeCategory ? `No posts in this category yet.` : `No posts yet.`}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {data?.items.map(p => <PostCard key={p.slug} post={p} />)}
          </div>
        )}

        {/* ── Pagination ──────────────────────────────────────── */}
        {data && (
          <Pagination
            page={data.page}
            total={data.total}
            pageSize={data.pageSize}
            onPageChange={setPage}
          />
        )}
      </div>

      <Footer />
    </div>
  )
}
