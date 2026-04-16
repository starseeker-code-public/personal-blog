import { Link } from 'react-router-dom'
import { SITE } from '../../data'

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-stone-300/50 dark:border-[#2d2855]/70 py-10">
      <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-stone-500 dark:text-[#8b7db8] text-xs">
          © {new Date().getFullYear()} {SITE.author.name} — Built with FastAPI, React and quality coffee ☕
        </p>

        <div className="flex items-center gap-5 text-stone-500 dark:text-[#8b7db8] text-xs">
          <a href={SITE.portfolio} target="_blank" rel="noopener noreferrer" className="hover:text-stone-700 dark:hover:text-[#c9beed] transition-colors">Portfolio</a>
          <a href={SITE.social.github} target="_blank" rel="noopener noreferrer" className="hover:text-stone-700 dark:hover:text-[#c9beed] transition-colors">GitHub</a>
          <Link to="/about" className="hover:text-stone-700 dark:hover:text-[#c9beed] transition-colors">About</Link>
          <a href={`mailto:${SITE.author.email}`} className="hover:text-stone-700 dark:hover:text-[#c9beed] transition-colors">Email</a>
        </div>
      </div>
    </footer>
  )
}
