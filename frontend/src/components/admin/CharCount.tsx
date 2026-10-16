interface CharCountProps {
  text: string
  /** Also count non-empty lines, for one-item-per-line lists. */
  items?: boolean
  className?: string
}

/** Live size of what's being typed in an admin editor. */
export function CharCount({ text, items = false, className = '' }: CharCountProps) {
  const chars = [...text].length
  const lines = text.split('\n').filter(line => line.trim()).length

  return (
    <p className={`text-xs text-stone-400 dark:text-[#5a5180] tabular-nums ${className}`}>
      {items && `${lines} ${lines === 1 ? 'item' : 'items'} · `}
      {chars.toLocaleString()} {chars === 1 ? 'character' : 'characters'}
    </p>
  )
}
