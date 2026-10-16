import { useI18n } from '../../i18n'

interface PostMetaProps {
  publishedAt: string
  updatedAt?: string
  readTimeMinutes: number
  author?: string
}

export function PostMeta({ publishedAt, updatedAt, readTimeMinutes, author }: PostMetaProps) {
  const { m, date } = useI18n()

  return (
    <div className="flex flex-wrap items-center gap-3 text-stone-500 dark:text-[#8b7db8] text-xs">
      {author && <span className="text-stone-700 dark:text-[#c9beed]">{author}</span>}
      {author && <span>·</span>}
      <time dateTime={publishedAt}>{date(publishedAt)}</time>
      {updatedAt && (
        <>
          <span>·</span>
          <span>{m.posts.updated(date(updatedAt, 'short'))}</span>
        </>
      )}
      <span>·</span>
      <span className="text-[#b81818] dark:text-orange-400">{m.posts.readTime(readTimeMinutes)}</span>
    </div>
  )
}
