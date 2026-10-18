import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import type { Post } from '../types'
import { api } from '../data'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import { Section, SectionHeading, PostCard } from '../components/ui'
import { IcoArrowLeft } from '../components/icons'
import { useI18n } from '../i18n'
import { usePageHead } from '../seo'

export default function Search() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''
  const { lang, m, path } = useI18n()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Results pages stay out of search engines.
  usePageHead({ title: m.seo.searchTitle(query.trim()), description: m.seo.homeDescription, noindex: true })

  useEffect(() => {
    if (!query.trim()) return
    setLoading(true)
    setError(null)
    api.search(query, lang)
      .then(setPosts)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [query, lang])

  return (
    <div className="min-h-screen bg-[#efead8] dark:bg-[#0f0d24] font-sans transition-colors duration-300">
      <Navbar />

      <Section id="search-results">
        <Link
          to={path('/')}
          className="inline-flex items-center gap-2 text-stone-500 dark:text-[#8b7db8] hover:text-stone-700 dark:hover:text-[#c9beed] text-sm mb-8 transition-colors"
        >
          <IcoArrowLeft />
          {m.common.backToBlog}
        </Link>

        <SectionHeading>
          {query ? m.search.resultsFor(query) : m.search.title}
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
            <p className="text-stone-600 dark:text-[#c9beed] text-sm mb-2">{m.search.noResults(query)}</p>
            <p className="text-stone-500 dark:text-[#8b7db8] text-xs">{m.search.tryAnother}</p>
          </div>
        )}

        {!loading && posts.length > 0 && (
          <>
            <p className="text-stone-500 dark:text-[#8b7db8] text-xs mb-6 -mt-6">
              {m.search.resultCount(posts.length)}
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
