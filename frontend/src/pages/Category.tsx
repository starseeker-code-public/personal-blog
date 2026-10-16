import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import type { Category as CategoryType, Post, PaginatedResponse } from '../types'
import { api } from '../data'
import { TAGS_BY_CATEGORY } from '../data/tags'
import { slugify } from '../utils/slugify'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import { Section, SectionHeading, PostCard, Pagination } from '../components/ui'
import { IcoArrowLeft } from '../components/icons'
import { useI18n } from '../i18n'

// Every known tag by its slug, so a tag page can show the tag's name.
const TAG_BY_SLUG = new Map(Object.values(TAGS_BY_CATEGORY).flat().map(t => [slugify(t), t]))

interface CategoryProps {
  /** `tag` lists the posts with a tag (`/tags/:slug`) instead of a category. */
  kind?: 'category' | 'tag'
}

export default function Category({ kind = 'category' }: CategoryProps) {
  const { slug } = useParams<{ slug: string }>()
  const { lang, m, path, category: categoryName, tag: tagName } = useI18n()
  const [category, setCategory] = useState<CategoryType | null>(null)
  const [data, setData] = useState<PaginatedResponse<Post> | null>(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Another category or tag starts back on page 1.
  const listing = `${kind}:${slug}`
  const [pageOf, setPageOf] = useState(listing)
  if (pageOf !== listing) {
    setPageOf(listing)
    setPage(1)
  }

  useEffect(() => {
    if (!slug || kind !== 'category') return
    api.listCategories()
      .then(cats => setCategory(cats.find(c => c.slug === slug) ?? null))
      .catch(() => {})
  }, [slug, kind])

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    setError(null)
    api.listPosts(page, 10, kind === 'tag' ? { tag: slug, lang } : { category: slug, lang })
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [slug, kind, page, lang])

  const tagLabel = slug ? tagName(TAG_BY_SLUG.get(slug) ?? slug.replace(/-/g, ' ')) : ''

  return (
    <div className="min-h-screen bg-[#efead8] dark:bg-[#0f0d24] font-sans transition-colors duration-300">
      <Navbar />

      <Section id="category-posts">
        <Link
          to={path('/')}
          className="inline-flex items-center gap-2 text-stone-500 dark:text-[#8b7db8] hover:text-stone-700 dark:hover:text-[#c9beed] text-sm mb-8 transition-colors"
        >
          <IcoArrowLeft />
          {m.common.allPosts}
        </Link>

        {kind === 'tag' ? (
          <SectionHeading>#{tagLabel}</SectionHeading>
        ) : category ? (
          <>
            <SectionHeading>{categoryName(category.name)}</SectionHeading>
            {category.description && (
              <p className="text-stone-600 dark:text-[#c9beed] text-sm mb-8 -mt-6">{category.description}</p>
            )}
          </>
        ) : (
          <SectionHeading>{m.category.fallbackTitle}</SectionHeading>
        )}

        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="rounded-xl border border-stone-200 dark:border-[#322d5a] bg-[#e4ddba]/60 dark:bg-[#1a1735]/60 p-5 animate-pulse h-36" />
            ))}
          </div>
        )}

        {error && <p className="text-stone-500 dark:text-[#8b7db8] text-sm">{error}</p>}

        {!loading && data && (
          <>
            {data.items.length === 0 ? (
              <p className="text-stone-500 dark:text-[#8b7db8] text-sm">
                {kind === 'tag' ? m.posts.noneWithTag : m.posts.noneInCategory}
              </p>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2">
                {data.items.map(p => <PostCard key={p.slug} post={p} />)}
              </div>
            )}

            <Pagination
              page={data.page}
              total={data.total}
              pageSize={data.pageSize}
              onPageChange={setPage}
            />
          </>
        )}
      </Section>

      <Footer />
    </div>
  )
}
