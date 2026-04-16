import { Link } from 'react-router-dom'
import { slugify } from '../../utils/slugify'

interface TagProps {
  label: string
  /** When true, wraps the tag in a link to /categories/<slug> */
  linkable?: boolean
}

export function Tag({ label, linkable = false }: TagProps) {
  const pill = (
    <span className="text-xs px-2 py-1 rounded-full bg-indigo-900/60 text-indigo-300 border border-indigo-700/50 whitespace-nowrap">
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
