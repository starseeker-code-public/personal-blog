import { useState } from 'react'
import { Tag } from './Tag'

interface TagListProps {
  tags: string[]
  /** Tags beyond this count collapse behind a "…" chip that expands on click or hover. */
  maxVisible?: number
  linkable?: boolean
}

/**
 * Renders a list of tag pills. If the list exceeds `maxVisible`, only the
 * first N are shown and the rest appear after clicking or hovering the
 * ellipsis chip. The chip itself is not a link, so clicking it inside a
 * `<Link>` wrapper does not navigate — we stop the event.
 */
export function TagList({ tags, maxVisible = 5, linkable = false }: TagListProps) {
  const [expanded, setExpanded] = useState(false)

  if (tags.length === 0) return null

  const overflows = tags.length > maxVisible
  const head = overflows && !expanded ? tags.slice(0, maxVisible) : tags
  const hiddenCount = tags.length - maxVisible

  return (
    <div
      className="flex flex-wrap items-center gap-1.5"
      onMouseLeave={() => overflows && setExpanded(false)}
    >
      {head.map(t => (
        <Tag key={t} label={t} linkable={linkable} />
      ))}
      {overflows && !expanded && (
        <button
          type="button"
          onMouseEnter={() => setExpanded(true)}
          onClick={e => {
            e.preventDefault()
            e.stopPropagation()
            setExpanded(true)
          }}
          className="text-xs px-2 py-1 rounded-full bg-[rgba(221,0,0,0.07)] dark:bg-[#2d1f4e] text-[#dd0000] dark:text-[#a78bfa] border border-[rgba(221,0,0,0.42)] dark:border-[#4a3580] hover:bg-[rgba(221,0,0,0.15)] dark:hover:bg-[#3a2a5c] transition-colors whitespace-nowrap"
          title={`Show ${hiddenCount} more tag${hiddenCount === 1 ? '' : 's'}`}
          aria-label={`Show ${hiddenCount} more tag${hiddenCount === 1 ? '' : 's'}`}
        >
          …
        </button>
      )}
    </div>
  )
}
