import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import type { Post } from '../../types'
import { TagList } from './TagList'

interface PostCardProps {
  post: Post
}

export function PostCard({ post }: PostCardProps) {
  return (
    <Link
      to={`/posts/${post.slug}`}
      className="group block py-8 px-4 -mx-4 rounded-xl hover:bg-[rgba(221,0,0,0.05)] dark:hover:bg-[#1a1735]/70 transition-colors"
    >
      {/* Meta line */}
      <div className="flex flex-wrap items-center gap-2 text-xs mb-3">
        {post.category && (
          <span className="bg-[#2a3428] border border-[#1a2818] text-[#f0ead8] px-2 py-0.5 rounded dark:bg-amber-500/10 dark:border-amber-500/30 dark:text-amber-300 font-medium tracking-widest uppercase">
            {post.category}
          </span>
        )}
        {post.category && <span className="text-stone-400 dark:text-[#8b7db8]">·</span>}
        <time className="text-stone-500 dark:text-[#8b7db8]" dateTime={post.publishedAt}>
          {format(new Date(post.publishedAt), 'MMM d, yyyy')}
        </time>
        <span className="text-stone-400 dark:text-[#8b7db8]">·</span>
        <span className="text-[#dd0000] dark:text-orange-400">{post.readTimeMinutes} min read</span>
      </div>

      {/* Title */}
      <h2
        className="text-stone-900 dark:text-[#f0ecfd] text-xl sm:text-2xl font-bold leading-snug mb-3 group-hover:text-[#395144] dark:group-hover:text-amber-400 transition-colors"
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
        <TagList tags={post.tags} maxVisible={5} linkable />
        <span className="text-stone-400 dark:text-[#8b7db8] group-hover:text-[#395144] dark:group-hover:text-amber-400 transition-colors text-base shrink-0">
          →
        </span>
      </div>
    </Link>
  )
}
