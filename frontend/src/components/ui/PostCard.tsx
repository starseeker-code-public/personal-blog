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
      className="group block py-8 px-4 -mx-4 rounded-xl hover:bg-white/[0.025] transition-colors"
    >
      {/* Meta line */}
      <div className="flex flex-wrap items-center gap-2 text-xs mb-3">
        {post.category && (
          <span className="text-indigo-400 font-medium tracking-widest uppercase">
            {post.category}
          </span>
        )}
        {post.category && <span className="text-slate-700">·</span>}
        <time className="text-slate-500" dateTime={post.publishedAt}>
          {format(new Date(post.publishedAt), 'MMM d, yyyy')}
        </time>
        <span className="text-slate-700">·</span>
        <span className="text-slate-500">{post.readTimeMinutes} min read</span>
      </div>

      {/* Title */}
      <h2
        className="text-white text-xl sm:text-2xl font-bold leading-snug mb-3 group-hover:text-indigo-300 transition-colors"
        style={{ fontFamily: 'Exo 2' }}
      >
        {post.title}
      </h2>

      {/* Excerpt */}
      <p className="text-slate-400 text-sm leading-relaxed line-clamp-2 mb-4 font-serif">
        {post.excerpt}
      </p>

      {/* Tags + arrow */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-wrap gap-1.5">
          {post.tags.slice(0, 4).map(t => (
            <Tag key={t} label={t} linkable />
          ))}
        </div>
        <span className="text-slate-700 group-hover:text-indigo-400 transition-colors text-base shrink-0">
          →
        </span>
      </div>
    </Link>
  )
}
