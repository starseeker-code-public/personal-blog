import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { format } from 'date-fns'
import type { Post as PostType } from '../types'
import { api, SITE, resolveImageUrl } from '../data'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import { TagList, Prose } from '../components/ui'
import { IcoArrowLeft, IcoGithub, IcoGlobe } from '../components/icons'

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
    <div className="min-h-screen bg-[#efead8] dark:bg-[#0f0d24] font-sans transition-colors duration-300">
      <ReadingProgress />
      <Navbar />

      <main className="relative z-10 max-w-3xl mx-auto px-4 pt-28 pb-20">
        {loading && (
          <div className="space-y-4 animate-pulse">
            <div className="h-8 bg-[#d4cd9e]/70 dark:bg-[#231f42]/80 rounded w-3/4" />
            <div className="h-4 bg-[#d4cd9e]/70 dark:bg-[#231f42]/80 rounded w-1/2" />
            <div className="h-4 bg-[#d4cd9e]/70 dark:bg-[#231f42]/80 rounded w-full mt-8" />
            <div className="h-4 bg-[#d4cd9e]/70 dark:bg-[#231f42]/80 rounded w-full" />
          </div>
        )}

        {error && (
          <div className="text-center py-20">
            <p className="text-stone-600 dark:text-[#c9beed] text-lg mb-2">Post not found</p>
            <p className="text-stone-500 dark:text-[#8b7db8] text-sm mb-6">{error}</p>
            <Link to="/" className="text-[#798777] dark:text-amber-400 hover:text-[#798777]/80 dark:hover:text-amber-300 text-sm">
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

            {/* Meta row: category · author · date · read time */}
            <div className="flex flex-wrap items-center gap-2 text-xs mb-5">
              {post.category && (
                <span className="bg-[#2a3428] border border-[#1a2818] text-[#f0ead8] px-2.5 py-1 rounded-full dark:bg-amber-500/10 dark:border-amber-500/30 dark:text-amber-300 tracking-widest uppercase">
                  {post.category}
                </span>
              )}
              {post.category && <span className="text-stone-400 dark:text-[#8b7db8]">·</span>}
              {post.author?.name && <span className="text-stone-600 dark:text-[#c9beed]">{post.author.name}</span>}
              {post.author?.name && <span className="text-stone-400 dark:text-[#8b7db8]">·</span>}
              <time className="text-stone-500 dark:text-[#8b7db8]" dateTime={post.publishedAt}>
                {format(new Date(post.publishedAt), 'MMMM d, yyyy')}
              </time>
              {post.updatedAt && <span className="text-stone-400 dark:text-[#8b7db8]">·</span>}
              {post.updatedAt && <span className="text-stone-500 dark:text-[#8b7db8]">Updated {format(new Date(post.updatedAt), 'MMM d, yyyy')}</span>}
              <span className="text-stone-400 dark:text-[#8b7db8]">·</span>
              <span className="text-[#dd0000] dark:text-orange-400">{post.readTimeMinutes} min read</span>
            </div>

            {/* Title */}
            <h1
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-stone-900 dark:text-[#f0ecfd] leading-tight mb-6"
              style={{ fontFamily: 'Capriola' }}
            >
              {post.title}
            </h1>

            {/* Cover image + tags + body share a single flow so the floated
                image starts at the tag row and wraps both the tag line and
                the paragraphs that follow. Extra left/bottom margin around
                the image lets the text breathe rather than hugging it. */}
            {post.coverImage && (
              <img
                src={resolveImageUrl(post.coverImage)}
                alt={post.title}
                className="float-right ml-8 mb-6 rounded-xl border border-stone-200 dark:border-[#322d5a] object-cover w-[20vw] min-w-[150px] max-w-[260px] aspect-square"
              />
            )}

            {/* Tags — first 5 visible, rest collapse behind a "…" chip. */}
            {post.tags.length > 0 && (
              <div className="mt-2 mb-8">
                <TagList tags={post.tags} maxVisible={5} linkable />
              </div>
            )}

            <div>
              <Prose>{post.body}</Prose>

              {/* Goodbye signature — always present, italic serif + Marck Script
                  sign-off. `clear: both` makes sure it settles below the
                  floated image regardless of how short the body is. */}
              <div className="clear-both mt-12 pt-8 border-t border-stone-200 dark:border-[#322d5a] text-right">
                <p className="italic text-stone-600 dark:text-[#c9beed] font-serif text-base sm:text-lg leading-relaxed">
                  So many stories yet to tell… may your sky stay curious, your compass stubborn, and your horizon a bit wider.
                </p>
                <p
                  className="mt-3 text-2xl sm:text-3xl text-[#395144] dark:text-amber-400"
                  style={{ fontFamily: 'Marck Script' }}
                >
                  — Starseeker
                </p>
              </div>
            </div>

            {/* Author card — always present (orbit of GitHub + Portfolio icons). */}
            <div className="clear-both mt-12 flex justify-end">
              <div className="relative w-40 h-40 orbit-container">
                <a
                  href={post.author?.socials?.github ?? SITE.social.github}
                  target="_blank" rel="noopener noreferrer" title="GitHub"
                  className="orbit-circle absolute top-1/2 left-1/2 w-10 h-10 rounded-full border border-stone-300 bg-[#faf6ee] dark:bg-[#1a1735] dark:border-[#322d5a] flex items-center justify-center text-stone-500 dark:text-[#8b7db8] hover:border-[#dd0000] hover:text-[#dd0000] dark:hover:border-amber-400 dark:hover:text-amber-400 transition-colors z-30"
                >
                  <IcoGithub />
                </a>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full border-2 border-stone-200 dark:border-[#322d5a] overflow-hidden z-20">
                  <img
                    src={post.author?.avatar ?? 'https://github.com/starseeker-code-public.png'}
                    alt={post.author?.name ?? SITE.author.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <a
                  href={SITE.portfolio}
                  target="_blank" rel="noopener noreferrer" title="Portfolio"
                  className="orbit-circle-offset absolute top-1/2 left-1/2 w-10 h-10 rounded-full border border-stone-300 bg-[#faf6ee] dark:bg-[#1a1735] dark:border-[#322d5a] flex items-center justify-center text-stone-500 dark:text-[#8b7db8] hover:border-[#dd0000] hover:text-[#dd0000] dark:hover:border-amber-400 dark:hover:text-amber-400 transition-colors z-30"
                >
                  <IcoGlobe />
                </a>
              </div>
            </div>
          </article>
        )}
      </main>

      <Footer />
    </div>
  )
}
