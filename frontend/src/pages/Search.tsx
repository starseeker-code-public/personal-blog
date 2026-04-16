import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import type { Post } from '../types'
import { api } from '../data'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import { Section, SectionHeading, PostCard } from '../components/ui'
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
    <div className="min-h-screen bg-[#efead8] dark:bg-[#0f0d24] font-sans transition-colors duration-300">
      <Navbar />

      <Section id="search-results">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-stone-500 dark:text-[#8b7db8] hover:text-stone-700 dark:hover:text-[#c9beed] text-sm mb-8 transition-colors"
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
              <div key={i} className="rounded-xl border border-stone-200 dark:border-[#322d5a] bg-[#e4ddba]/60 dark:bg-[#1a1735]/60 p-5 animate-pulse h-36" />
            ))}
          </div>
        )}

        {error && <p className="text-stone-500 dark:text-[#8b7db8] text-sm">{error}</p>}

        {!loading && !error && posts.length === 0 && query && (
          <div className="text-center py-12">
            <p className="text-stone-600 dark:text-[#c9beed] text-sm mb-2">No posts found for "{query}"</p>
            <p className="text-stone-500 dark:text-[#8b7db8] text-xs">Try a different search term.</p>
          </div>
        )}

        {!loading && posts.length > 0 && (
          <>
            <p className="text-stone-500 dark:text-[#8b7db8] text-xs mb-6 -mt-6">
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
