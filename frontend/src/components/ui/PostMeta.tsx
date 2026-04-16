import { format } from 'date-fns'

interface PostMetaProps {
  publishedAt: string
  updatedAt?: string
  readTimeMinutes: number
  author?: string
}

export function PostMeta({ publishedAt, updatedAt, readTimeMinutes, author }: PostMetaProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 text-stone-500 dark:text-[#8b7db8] text-xs">
      {author && <span className="text-stone-700 dark:text-[#c9beed]">{author}</span>}
      {author && <span>·</span>}
      <time dateTime={publishedAt}>{format(new Date(publishedAt), 'MMMM d, yyyy')}</time>
      {updatedAt && (
        <>
          <span>·</span>
          <span>Updated {format(new Date(updatedAt), 'MMM d, yyyy')}</span>
        </>
      )}
      <span>·</span>
      <span className="text-[#b81818] dark:text-orange-400">{readTimeMinutes} min read</span>
    </div>
  )
}
