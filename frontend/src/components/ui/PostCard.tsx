import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import type { Post } from '../../types'
import { Tag } from './Tag'

interface PostCardProps {
  post: Post
}

export function PostCard({ post }: PostCardProps) {
  return (
    <Link
      to={`/posts/${post.slug}`}
      className="group block py-8 px-4 -mx-4 rounded-xl hover:bg-[#e4f0ea]/50 dark:hover:bg-[#1a1735]/70 transition-colors"
    >
      {/* Meta line */}
      <div className="flex flex-wrap items-center gap-2 text-xs mb-3">
        {post.category && (
          <span className="text-[#1a5c38] dark:text-amber-400 font-medium tracking-widest uppercase">
            {post.category}
          </span>
        )}
        {post.category && <span className="text-stone-400 dark:text-[#8b7db8]">·</span>}
        <time className="text-stone-500 dark:text-[#8b7db8]" dateTime={post.publishedAt}>
          {format(new Date(post.publishedAt), 'MMM d, yyyy')}
        </time>
        <span className="text-stone-400 dark:text-[#8b7db8]">·</span>
        <span className="text-stone-500 dark:text-[#8b7db8]">{post.readTimeMinutes} min read</span>
      </div>

      {/* Title */}
      <h2
        className="text-stone-900 dark:text-[#f0ecfd] text-xl sm:text-2xl font-bold leading-snug mb-3 group-hover:text-[#1e7a48] dark:group-hover:text-amber-400 transition-colors"
        style={{ fontFamily: 'Capriola' }}
      >
        {post.title}
      </h2>

      {/* Excerpt */}
      <p className="text-stone-600 dark:text-[#c9beed] text-sm leading-relaxed line-clamp-2 mb-4 font-serif">
        {post.excerpt}
      </p>

      {/* Tags + arrow */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-wrap gap-1.5">
          {post.tags.slice(0, 4).map(t => (
            <Tag key={t} label={t} linkable />
          ))}
        </div>
        <span className="text-stone-400 dark:text-[#8b7db8] group-hover:text-[#1e7a48] dark:group-hover:text-amber-400 transition-colors text-base shrink-0">
          →
        </span>
      </div>
    </Link>
  )
}
