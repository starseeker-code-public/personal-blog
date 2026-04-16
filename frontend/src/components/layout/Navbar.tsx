import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { SITE } from '../../data'
import { IcoGithub, IcoLinkedin, IcoMail, IcoMenu, IcoClose } from '../icons'

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
  const location = useLocation()

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur border-b border-white/5"
      style={{ background: 'rgba(6, 5, 22, 0.9)' }}
    >
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-6">

        {/* Logo — links to personal portfolio */}
        <a
          href={SITE.portfolio}
          target="_blank"
          rel="noopener noreferrer"
          className="text-violet-400 font-bold tracking-widest text-sm shrink-0 font-caveat hover:text-violet-300 transition-colors"
        >
          JHM
        </a>

        {/* Nav links */}
        <ul className="hidden sm:flex gap-6 flex-1">
          {NAV_LINKS.map(l => (
            <li key={l.label}>
              <Link
                to={l.href}
                className={`text-sm transition-colors ${
                  location.pathname === l.href ? 'text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Social icons */}
        <div className="hidden sm:flex items-center gap-3 ml-auto shrink-0">
          {SOCIAL.map(s => (
            <a
              key={s.key}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-500 hover:text-violet-400 transition-colors"
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

          <div className="flex gap-5 pt-5">
            {SOCIAL.map(s => (
              <a
                key={s.key}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-500 hover:text-violet-400 transition-colors"
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
