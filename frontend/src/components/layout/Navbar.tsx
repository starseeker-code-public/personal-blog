import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { SITE } from '../../data'
import { IcoGithub, IcoLinkedin, IcoMail, IcoMenu, IcoClose, IcoSearch } from '../icons'

const NAV_LINKS = [
  { label: 'Blog', href: '/' },
  { label: 'About', href: '/about' },
]

const SOCIAL = [
  { key: 'github',   icon: <IcoGithub />,   href: SITE.social.github },
  { key: 'linkedin', icon: <IcoLinkedin />, href: SITE.social.linkedin },
  { key: 'email',    icon: <IcoMail />,     href: `mailto:${SITE.author.email}` },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()
  const location = useLocation()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
      setOpen(false)
    }
  }

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur border-b border-white/5"
      style={{ background: 'rgba(6, 5, 22, 0.9)' }}
    >
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-4">

        {/* Logo */}
        <Link to="/" className="text-indigo-400 font-bold tracking-widest text-sm shrink-0 font-anta mr-2">
          JHM
        </Link>

        {/* Nav links */}
        <ul className="hidden sm:flex gap-5">
          {NAV_LINKS.map(l => (
            <li key={l.label}>
              <Link
                to={l.href}
                className={`text-xs tracking-wide transition-colors ${
                  location.pathname === l.href ? 'text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Search — always visible, stretches to fill space */}
        <form
          onSubmit={handleSearch}
          className="hidden sm:flex flex-1 items-center gap-2 bg-slate-900/60 border border-white/8 rounded-lg px-3 py-1.5 focus-within:border-indigo-500/60 transition-colors"
        >
          <span className="text-slate-500 shrink-0"><IcoSearch /></span>
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search posts…"
            className="flex-1 bg-transparent text-white text-xs outline-none placeholder:text-slate-600 min-w-0"
          />
          {searchQuery && (
            <button
              type="submit"
              className="shrink-0 text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
            >
              Go
            </button>
          )}
        </form>

        {/* Social icons */}
        <div className="hidden sm:flex items-center gap-3 shrink-0">
          {SOCIAL.map(s => (
            <a
              key={s.key}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-500 hover:text-indigo-400 transition-colors"
            >
              {s.icon}
            </a>
          ))}
        </div>

        {/* Mobile toggle */}
        <button
          className="sm:hidden text-slate-400 ml-auto"
          onClick={() => setOpen(o => !o)}
          aria-label="Toggle menu"
        >
          {open ? <IcoClose /> : <IcoMenu />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div
          className="sm:hidden border-t border-white/5 px-4 pb-6"
          style={{ background: 'rgb(6, 5, 22)' }}
        >
          {NAV_LINKS.map(l => (
            <Link
              key={l.label}
              to={l.href}
              onClick={() => setOpen(false)}
              className="block py-3 text-slate-300 hover:text-white text-sm border-b border-white/5 transition-colors"
            >
              {l.label}
            </Link>
          ))}

          {/* Mobile search */}
          <form onSubmit={handleSearch} className="mt-4 flex gap-2">
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search posts…"
              className="flex-1 bg-slate-900/80 border border-white/10 text-white text-xs rounded-lg px-3 py-2.5 outline-none focus:border-indigo-500 placeholder:text-slate-500 transition-colors"
            />
            <button
              type="submit"
              className="px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
              aria-label="Search"
            >
              <IcoSearch />
            </button>
          </form>

          <div className="flex gap-5 pt-5">
            {SOCIAL.map(s => (
              <a
                key={s.key}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-500 hover:text-indigo-400 transition-colors"
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}
