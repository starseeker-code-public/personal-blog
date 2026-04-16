import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { SITE } from '../../data'
import { IcoGithub, IcoLinkedin, IcoMail, IcoMenu, IcoClose, IcoSun, IcoMoon } from '../icons'
import { useTheme } from '../../context/ThemeContext'

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
  const { theme, toggle } = useTheme()

  // Only show the link to the *other* page (not the one you're on)
  const visibleLinks = NAV_LINKS.filter(l => l.href !== location.pathname)

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur border-b border-stone-300/50 dark:border-[#2d2855]/70"
      style={{ background: 'var(--nav-bg)' }}
    >
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-6">

        {/* Logo */}
        <a
          href={SITE.portfolio}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#4e6c50] dark:text-amber-400 font-bold tracking-widest text-sm shrink-0 font-caveat hover:text-[#395144] dark:hover:text-amber-300 transition-colors"
        >
          JHM
        </a>

        {/* Nav links */}
        <ul className="hidden sm:flex gap-6 flex-1">
          {visibleLinks.map(l => (
            <li key={l.label}>
              <Link
                to={l.href}
                className="text-sm text-stone-600 dark:text-[#c9beed] hover:text-[#4e6c50] dark:hover:text-[#f0ecfd] transition-colors"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right side: social icons + theme toggle */}
        <div className="hidden sm:flex items-center gap-3 ml-auto shrink-0">
          {SOCIAL.map(s => (
            <a
              key={s.key}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-stone-500 dark:text-[#8b7db8] hover:text-[#dd0000] dark:hover:text-amber-400 transition-colors"
            >
              {s.icon}
            </a>
          ))}
          <button
            onClick={toggle}
            className="ml-1 p-1.5 rounded-lg text-stone-500 dark:text-[#8b7db8] hover:text-[#dd0000] dark:hover:text-amber-400 hover:bg-[rgba(221,0,0,0.09)] dark:hover:bg-[#2d2855]/60 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <IcoSun /> : <IcoMoon />}
          </button>
        </div>

        {/* Mobile toggle */}
        <div className="sm:hidden flex items-center gap-2 ml-auto">
          <button
            onClick={toggle}
            className="p-1.5 rounded-lg text-stone-500 dark:text-[#8b7db8] hover:text-[#dd0000] dark:hover:text-amber-400 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <IcoSun /> : <IcoMoon />}
          </button>
          <button
            className="text-stone-600 dark:text-[#c9beed]"
            onClick={() => setOpen(o => !o)}
            aria-label="Toggle menu"
          >
            {open ? <IcoClose /> : <IcoMenu />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div
          className="sm:hidden border-t border-stone-200/70 dark:border-[#2d2855]/70 px-4 pb-6"
          style={{ background: 'var(--nav-mobile-bg)' }}
        >
          {visibleLinks.map(l => (
            <Link
              key={l.label}
              to={l.href}
              onClick={() => setOpen(false)}
              className="block py-3 text-stone-700 dark:text-[#c9beed] hover:text-[#4e6c50] dark:hover:text-[#f0ecfd] text-sm border-b border-stone-200/70 dark:border-[#2d2855]/70 transition-colors"
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
                className="text-stone-500 dark:text-[#8b7db8] hover:text-[#dd0000] dark:hover:text-amber-400 transition-colors"
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
