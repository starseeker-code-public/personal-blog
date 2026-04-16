import { Link } from 'react-router-dom'
import { slugify } from '../../utils/slugify'

interface TagProps {
  label: string
  linkable?: boolean
}

export function Tag({ label, linkable = false }: TagProps) {
  const pill = (
    <span className="text-xs px-2 py-1 rounded-full bg-[rgba(221,0,0,0.07)] dark:bg-[#2d1f4e] text-[#dd0000] dark:text-[#a78bfa] border border-[rgba(221,0,0,0.42)] dark:border-[#4a3580] whitespace-nowrap">
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
