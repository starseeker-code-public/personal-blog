import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import type { Category as CategoryType, Post, PaginatedResponse } from '../types'
import { api } from '../data'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import { Section, SectionHeading, PostCard, Pagination } from '../components/ui'
import { IcoArrowLeft } from '../components/icons'

export default function Category() {
  const { slug } = useParams<{ slug: string }>()
  const [category, setCategory] = useState<CategoryType | null>(null)
  const [data, setData] = useState<PaginatedResponse<Post> | null>(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) return
    api.listCategories()
      .then(cats => setCategory(cats.find(c => c.slug === slug) ?? null))
      .catch(() => {})
  }, [slug])

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    api.listPosts(page, 10, { category: slug })
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [slug, page])

  return (
    <div className="min-h-screen bg-[#f5ede0] dark:bg-[#0f0d24] font-sans transition-colors duration-300">
      <Navbar />

      <Section id="category-posts">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-stone-500 dark:text-[#8b7db8] hover:text-stone-700 dark:hover:text-[#c9beed] text-sm mb-8 transition-colors"
        >
          <IcoArrowLeft />
          All posts
        </Link>

        {category ? (
          <>
            <SectionHeading>{category.name}</SectionHeading>
            {category.description && (
              <p className="text-stone-600 dark:text-[#c9beed] text-sm mb-8 -mt-6">{category.description}</p>
            )}
          </>
        ) : (
          <SectionHeading>Category</SectionHeading>
        )}

        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="rounded-xl border border-stone-200 dark:border-[#322d5a] bg-[#ede0cc]/60 dark:bg-[#1a1735]/60 p-5 animate-pulse h-36" />
            ))}
          </div>
        )}

        {error && <p className="text-stone-500 dark:text-[#8b7db8] text-sm">{error}</p>}

        {!loading && data && (
          <>
            {data.items.length === 0 ? (
              <p className="text-stone-500 dark:text-[#8b7db8] text-sm">No posts in this category yet.</p>
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
