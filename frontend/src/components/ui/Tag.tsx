import { Link } from 'react-router-dom'
import { slugify } from '../../utils/slugify'

interface TagProps {
  label: string
  linkable?: boolean
}

export function Tag({ label, linkable = false }: TagProps) {
  const pill = (
    <span className="text-xs px-2 py-1 rounded-full bg-[#f5edd8] dark:bg-[#2d1f4e] text-[#7c3b1a] dark:text-[#a78bfa] border border-[#d4a870] dark:border-[#4a3580] whitespace-nowrap">
      {label}
    </span>
  )

  if (!linkable) return pill

  return (
    <Link to={`/categories/${slugify(label)}`} className="hover:opacity-80 transition-opacity">
      {pill}
    </Link>
  )
}
