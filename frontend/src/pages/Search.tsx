import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import type { Post } from '../types'
import { api } from '../data'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import { Stars, Section, SectionHeading, PostCard } from '../components/ui'
import { IcoArrowLeft } from '../components/icons'

export default function Search() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!query.trim()) return
    setLoading(true)
    setError(null)
    api.search(query)
      .then(setPosts)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [query])

  return (
    <div className="min-h-screen bg-slate-950 font-sans">
      <Stars />
      <Navbar />

      <Section id="search-results">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors"
        >
          <IcoArrowLeft />
          Back to blog
        </Link>

        <SectionHeading>
          {query ? `Results for "${query}"` : 'Search'}
        </SectionHeading>

        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="rounded-xl border border-white/10 bg-slate-900/50 p-5 animate-pulse h-36" />
            ))}
          </div>
        )}

        {error && <p className="text-slate-500 text-sm">{error}</p>}

        {!loading && !error && posts.length === 0 && query && (
          <div className="text-center py-12">
            <p className="text-slate-400 text-sm mb-2">No posts found for "{query}"</p>
            <p className="text-slate-600 text-xs">Try a different search term.</p>
          </div>
        )}

        {!loading && posts.length > 0 && (
          <>
            <p className="text-slate-500 text-xs mb-6 -mt-6">
              {posts.length} result{posts.length !== 1 ? 's' : ''}
            </p>
            <div className="grid gap-5 sm:grid-cols-2">
              {posts.map(p => <PostCard key={p.slug} post={p} />)}
            </div>
          </>
        )}
      </Section>

      <Footer />
    </div>
  )
}
