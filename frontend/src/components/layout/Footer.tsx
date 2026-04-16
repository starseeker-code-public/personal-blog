import { Link } from 'react-router-dom'
import { SITE } from '../../data'
import { IcoRss } from '../icons'

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-stone-300/50 dark:border-[#2d2855]/70 py-10">
      <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-stone-500 dark:text-[#8b7db8] text-xs">
          © {new Date().getFullYear()} {SITE.author.name} — Built with FastAPI, React &amp; Tailwind
        </p>

        <div className="flex items-center gap-5 text-stone-500 dark:text-[#8b7db8] text-xs">
          <Link to="/" className="hover:text-stone-700 dark:hover:text-[#c9beed] transition-colors">Latest</Link>
          <Link to="/about" className="hover:text-stone-700 dark:hover:text-[#c9beed] transition-colors">About</Link>
          <a
            href="/feed.xml"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-amber-700 dark:hover:text-amber-400 transition-colors"
            title="RSS Feed"
          >
            <IcoRss />
            <span>RSS</span>
          </a>
        </div>
      </div>
    </footer>
  )
}
