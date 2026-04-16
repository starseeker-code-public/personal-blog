import { format } from 'date-fns'

interface PostMetaProps {
  publishedAt: string
  updatedAt?: string
  readTimeMinutes: number
  author?: string
}

export function PostMeta({ publishedAt, updatedAt, readTimeMinutes, author }: PostMetaProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 text-slate-500 text-xs">
      {author && <span className="text-slate-400">{author}</span>}
      {author && <span>·</span>}
      <time dateTime={publishedAt}>{format(new Date(publishedAt), 'MMMM d, yyyy')}</time>
      {updatedAt && (
        <>
          <span>·</span>
          <span>Updated {format(new Date(updatedAt), 'MMM d, yyyy')}</span>
        </>
      )}
      <span>·</span>
      <span>{readTimeMinutes} min read</span>
    </div>
  )
}
