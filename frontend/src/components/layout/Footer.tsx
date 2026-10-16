import { Link } from 'react-router-dom'
import { SITE } from '../../data'
import { useI18n } from '../../i18n'

export default function Footer() {
  const { m, path } = useI18n()

  return (
    <footer className="relative z-10 border-t border-stone-300/50 dark:border-[#2d2855]/70 py-10">
      <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-stone-500 dark:text-[#8b7db8] text-xs">
          © {new Date().getFullYear()} {SITE.author.name} — {m.footer.builtWith}
        </p>

        <div className="flex items-center gap-5 text-stone-500 dark:text-[#8b7db8] text-xs">
          <a href={SITE.portfolio} target="_blank" rel="noopener noreferrer" className="hover:text-stone-700 dark:hover:text-[#c9beed] transition-colors">{m.footer.portfolio}</a>
          <a href={SITE.social.github} target="_blank" rel="noopener noreferrer" className="hover:text-stone-700 dark:hover:text-[#c9beed] transition-colors">GitHub</a>
          <Link to={path('/about')} className="hover:text-stone-700 dark:hover:text-[#c9beed] transition-colors">{m.footer.about}</Link>
          <a href={`mailto:${SITE.author.email}`} className="hover:text-stone-700 dark:hover:text-[#c9beed] transition-colors">{m.footer.email}</a>
        </div>
      </div>
    </footer>
  )
}
