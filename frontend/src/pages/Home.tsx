import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Category, PaginatedResponse, Post } from '../types'
import { api, SITE } from '../data'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import { PostCard, Pagination } from '../components/ui'
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
        className="text-amber-700 dark:text-amber-400 text-xs tracking-[0.3em] uppercase mb-3 inline-block animate-pulse hover:text-amber-600 dark:hover:text-amber-300 transition-colors"
      >
        Visit my portfolio →
      </a>
    )
  }

  return (
    <p className="text-amber-700 dark:text-amber-400 text-xs tracking-[0.3em] uppercase mb-3">Personal Blog</p>
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
    <div className="min-h-screen bg-[#f0e8d5] dark:bg-[#0f0d24] font-sans transition-colors duration-300">
      <Navbar />

      <div className="relative z-10 max-w-2xl mx-auto px-4 pt-28 pb-16">

        {/* ── Blog header ─────────────────────────────────────── */}
        <header className="text-center mb-10">
          <HeaderBadge />
          <h1 className="text-5xl sm:text-6xl text-[#152b1e] dark:text-[#f0ecfd] mb-3 font-caveat leading-none">
            {SITE.name}
          </h1>
          <p className="text-stone-500 dark:text-[#8b7db8] text-sm">{SITE.tagline}</p>
        </header>

        {/* ── Search bar ──────────────────────────────────────── */}
        <form onSubmit={handleSearch} className="relative mb-10 group">
          <span className="absolute left-4 inset-y-0 flex items-center pointer-events-none text-stone-500 dark:text-[#8b7db8] group-focus-within:text-[#1a5c38] dark:group-focus-within:text-amber-400 transition-colors">
            <IcoSearch />
          </span>
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search posts by title, topic, or keyword…"
            className="w-full pl-11 pr-20 py-3.5 bg-[#e5dac8]/70 dark:bg-[#1a1735]/70 border border-stone-300 dark:border-[#322d5a] rounded-xl text-stone-900 dark:text-[#f0ecfd] text-sm placeholder:text-stone-500 dark:placeholder:text-[#8b7db8] outline-none focus:border-[#1a5c38] dark:focus:border-amber-500 focus:bg-[#e8f2ed]/80 dark:focus:bg-[#1a1735]/90 focus:shadow-[0_0_0_3px_rgba(26,92,56,0.12)] dark:focus:shadow-[0_0_0_3px_rgba(245,158,11,0.15)] transition-all"
          />
          <button
            type="submit"
            className={`absolute right-2.5 inset-y-0 my-auto h-8 px-3.5 rounded-lg text-xs font-medium transition-all ${
              searchQuery.trim()
                ? 'bg-[#1a5c38] hover:bg-[#225c3a] dark:bg-amber-500 dark:hover:bg-amber-400 text-[#f0f7f2] opacity-100'
                : 'bg-stone-300 dark:bg-[#231f42] text-stone-400 opacity-0 pointer-events-none'
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
                  ? 'bg-[#1a5c38] dark:bg-amber-500 border-[#1a5c38] dark:border-amber-400 text-[#f0f7f2] dark:text-[#0f0d24]'
                  : 'border-stone-300 dark:border-[#322d5a] text-stone-600 dark:text-[#8b7db8] hover:text-[#1a5c38] dark:hover:text-[#f0ecfd] hover:border-[#1a5c38] dark:hover:border-[#4a4480] bg-transparent'
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
                    ? 'bg-[#1a5c38] dark:bg-amber-500 border-[#1a5c38] dark:border-amber-400 text-[#f0f7f2] dark:text-[#0f0d24]'
                    : 'border-stone-300 dark:border-[#322d5a] text-stone-600 dark:text-[#8b7db8] hover:text-[#1a5c38] dark:hover:text-[#f0ecfd] hover:border-[#1a5c38] dark:hover:border-[#4a4480] bg-transparent'
                }`}
              >
                {c.name}
                <span className={`ml-1.5 text-[11px] ${activeCategory === c.slug ? 'text-[#d4ece0] dark:text-amber-900' : 'text-stone-500 dark:text-[#8b7db8]'}`}>
                  {c.postCount}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* ── Post count ──────────────────────────────────────── */}
        {!loading && data && (
          <p className="text-stone-500 dark:text-[#8b7db8] text-xs mb-2">
            {data.total} {data.total === 1 ? 'post' : 'posts'}
            {activeCategoryName ? ` in ${activeCategoryName}` : ''}
          </p>
        )}

        {/* ── Post list ───────────────────────────────────────── */}
        {loading ? (
          <div className="divide-y divide-[#b8956a] dark:divide-[#2d2855]">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="py-8 space-y-3 animate-pulse">
                <div className="h-3 bg-[#d8ccb8]/70 dark:bg-[#231f42]/80 rounded w-1/4" />
                <div className="h-6 bg-[#d8ccb8]/70 dark:bg-[#231f42]/80 rounded w-3/4" />
                <div className="h-4 bg-[#d8ccb8]/70 dark:bg-[#231f42]/80 rounded w-full" />
                <div className="h-4 bg-[#d8ccb8]/70 dark:bg-[#231f42]/80 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : data?.items.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-stone-500 dark:text-[#8b7db8] text-sm">
              {activeCategory ? `No posts in this category yet.` : `No posts yet.`}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#b8956a] dark:divide-[#2d2855]">
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
