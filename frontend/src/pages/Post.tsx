import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import type { Post as PostType } from '../types'
import { api } from '../data'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import { Tag, PostMeta, Prose } from '../components/ui'
import { IcoArrowLeft } from '../components/icons'

function ReadingProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement
      const scrolled = doc.scrollTop
      const total = doc.scrollHeight - doc.clientHeight
      setProgress(total > 0 ? (scrolled / total) * 100 : 0)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div
      className="reading-progress"
      style={{ width: `${progress}%` }}
      role="progressbar"
      aria-valuenow={progress}
    />
  )
}

export default function Post() {
  const { slug } = useParams<{ slug: string }>()
  const [post, setPost] = useState<PostType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    api.getPost(slug)
      .then(setPost)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [slug])

  return (
    <div className="min-h-screen bg-[#f0e8d5] dark:bg-[#0f0d24] font-sans transition-colors duration-300">
      <ReadingProgress />
      <Navbar />

      <main className="relative z-10 max-w-3xl mx-auto px-4 pt-28 pb-20">
        {loading && (
          <div className="space-y-4 animate-pulse">
            <div className="h-8 bg-[#d8ccb8]/70 dark:bg-[#231f42]/80 rounded w-3/4" />
            <div className="h-4 bg-[#d8ccb8]/70 dark:bg-[#231f42]/80 rounded w-1/2" />
            <div className="h-4 bg-[#d8ccb8]/70 dark:bg-[#231f42]/80 rounded w-full mt-8" />
            <div className="h-4 bg-[#d8ccb8]/70 dark:bg-[#231f42]/80 rounded w-full" />
          </div>
        )}

        {error && (
          <div className="text-center py-20">
            <p className="text-stone-600 dark:text-[#c9beed] text-lg mb-2">Post not found</p>
            <p className="text-stone-500 dark:text-[#8b7db8] text-sm mb-6">{error}</p>
            <Link to="/" className="text-amber-700 dark:text-amber-400 hover:text-amber-600 dark:hover:text-amber-300 text-sm">
              ← Back to blog
            </Link>
          </div>
        )}

        {post && (
          <article>
            {/* Back link */}
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-stone-500 dark:text-[#8b7db8] hover:text-stone-700 dark:hover:text-[#c9beed] text-sm mb-8 transition-colors"
            >
              <IcoArrowLeft />
              Back to blog
            </Link>

            {/* Category */}
            {post.category && (
              <p className="text-[#1a5c38] dark:text-amber-400 text-xs tracking-widest uppercase mb-3">
                {post.category}
              </p>
            )}

            {/* Title */}
            <h1
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-stone-900 dark:text-[#f0ecfd] leading-tight mb-6"
              style={{ fontFamily: 'Capriola' }}
            >
              {post.title}
            </h1>

            {/* Meta */}
            <PostMeta
              publishedAt={post.publishedAt}
              updatedAt={post.updatedAt}
              readTimeMinutes={post.readTimeMinutes}
              author={post.author?.name}
            />

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4 mb-10">
                {post.tags.map(t => <Tag key={t} label={t} linkable />)}
              </div>
            )}

            {/* Cover image */}
            {post.coverImage && (
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full rounded-xl border border-stone-200 dark:border-[#322d5a] mb-10 object-cover max-h-80"
              />
            )}

            {/* Body */}
            <div className="mt-6">
              <Prose>{post.body}</Prose>
            </div>

            {/* Author card */}
            {post.author && (
              <div className="mt-16 rounded-xl border border-stone-200 dark:border-[#322d5a] bg-[#e5dac8]/60 dark:bg-[#1a1735]/60 p-6 flex gap-4 items-start">
                {post.author.avatar && (
                  <img
                    src={post.author.avatar}
                    alt={post.author.name}
                    className="w-12 h-12 rounded-full border border-stone-200 dark:border-[#322d5a] shrink-0"
                  />
                )}
                <div>
                  <p className="text-stone-900 dark:text-[#f0ecfd] font-medium text-sm">{post.author.name}</p>
                  {post.author.bio && (
                    <p className="text-stone-600 dark:text-[#c9beed] text-xs mt-1 leading-relaxed">{post.author.bio}</p>
                  )}
                  {post.author.socials?.github && (
                    <a
                      href={post.author.socials.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-700 dark:text-amber-400 text-xs hover:underline mt-2 inline-block"
                    >
                      GitHub →
                    </a>
                  )}
                </div>
              </div>
            )}
          </article>
        )}
      </main>

      <Footer />
    </div>
  )
}
