import { Link } from 'react-router-dom'
import { differenceInYears } from 'date-fns'
import { CAREER_START, SITE } from '../data'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import {
  IcoGithub, IcoLinkedin, IcoDevTo, IcoGlobe,
} from '../components/icons'
import { useI18n, type Messages } from '../i18n'
import fiveADayImage from '../../image/five-a-day.png'
import engineeringImage from '../../image/engineering-rust.svg'
import meAndMyLoveImage from '../../image/me-and-my-love-web.jpg'

// The page's text lives in i18n/locales/<lang>.ts, under `about`.

const SOCIALS = [
  { key: 'portfolio', label: 'Portfolio', icon: <IcoGlobe />,    href: SITE.portfolio },
  { key: 'github',    label: 'GitHub',    icon: <IcoGithub />,   href: SITE.social.github },
  { key: 'linkedin',  label: 'LinkedIn',  icon: <IcoLinkedin />, href: SITE.social.linkedin },
  { key: 'devto',     label: 'Dev.to',    icon: <IcoDevTo />,    href: SITE.social.devto },
]

type AboutText = Messages['about']

// Unsplash images are placeholders until the real photos are in frontend/image/.
const GALLERY: { key: keyof AboutText['gallery']['captions']; image: string; position?: string }[] = [
  { key: 'me',        image: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=600&q=80' },
  { key: 'astronomy', image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&q=80' },
  { key: 'warhammer', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80' },
  { key: 'barista',   image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&q=80' },
  { key: 'tourism',   image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&q=80' },
  // A wide screenshot: keep its left side (logo and heading) in the square tile.
  { key: 'fiveADay',  image: fiveADayImage, position: 'object-left' },
]

const FEATURES: { key: keyof AboutText['features']; image: string; position?: string }[] = [
  { key: 'engineering', image: engineeringImage },
  // Placeholder until the photo of me playing the piano is in.
  { key: 'hobbies',     image: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800&q=80' },
  // A portrait photo in a landscape frame: aim a little above the middle, at our faces.
  { key: 'life',        image: meAndMyLoveImage, position: 'object-[50%_30%]' },
]

export default function About() {
  const { m, path } = useI18n()
  const a = m.about
  // Spelled out by each locale: "Eight years…" / "Ocho años…".
  const years = differenceInYears(new Date(), CAREER_START)

  return (
    <div className="min-h-screen bg-[#efead8] dark:bg-[#0f0d24] font-sans transition-colors duration-300">
      <Navbar />

      <div className="relative z-10 max-w-2xl mx-auto px-4 pt-28 pb-20 space-y-16">

        {/* ── Intro ─────────────────────────────────────────────── */}
        <section>
          <h1
            className="text-5xl sm:text-6xl text-[#395144] dark:text-[#f0ecfd] mb-7 leading-none"
            style={{ fontFamily: 'Caveat' }}
          >
            {a.greeting}
          </h1>

          <div className="space-y-4 text-stone-700 dark:text-[#c9beed] text-sm sm:text-base leading-relaxed text-justify">
            <p>
              {a.intro.workBefore}
              <a href="https://www.allot.com" target="_blank" rel="noopener noreferrer" className="text-[#dd0000] dark:text-amber-400 hover:underline">Allot</a>
              {a.intro.workAfter(years)}
            </p>
            <p>{a.intro.notAll}</p>
            <p>{a.intro.passions}</p>
            <p>{a.intro.corner}</p>
          </div>

          {/* Social icons carousel — 4 icons, pause on hover */}
          <div className="mt-8 w-56 mx-auto overflow-hidden carousel-fade carousel-container">
            <div className="flex items-center gap-10 carousel-inner [&_svg]:w-6 [&_svg]:h-6">
              {[...SOCIALS, ...SOCIALS].map((s, i) => (
                <a
                  key={`${s.key}-${i}`}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={s.label}
                  className="text-stone-500 dark:text-[#8b7db8] hover:text-[#dd0000] dark:hover:text-amber-400 transition-colors shrink-0"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* ── Currently ─────────────────────────────────────────── */}
        <section>
          <h2 className="text-stone-900 dark:text-[#f0ecfd] font-semibold text-base mb-4" style={{ fontFamily: 'Capriola' }}>
            {a.currently.heading}
          </h2>
          <div className="rounded-xl border border-amber-400/50 dark:border-amber-500/40 bg-amber-50 dark:bg-amber-500/10 p-5">
            <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
              <div>
                <span className="text-stone-900 dark:text-[#f0ecfd] text-sm font-medium">{a.currently.role}</span>
                <span className="text-stone-500 dark:text-[#8b7db8] text-sm">{a.currently.at}</span>
                <a href="https://www.allot.com" target="_blank" rel="noopener noreferrer" className="text-[#dd0000] dark:text-amber-400 text-sm hover:underline">
                  Allot
                </a>
              </div>
              <span className="text-[#798777] dark:text-amber-400 text-xs flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400" />
                {a.currently.period}
              </span>
            </div>
            <p className="text-stone-600 dark:text-[#c9beed] text-xs leading-relaxed text-justify">
              {a.currently.description}
            </p>
          </div>
          <p className="text-stone-500 dark:text-[#8b7db8] text-xs mt-3 pl-1">
            {a.currently.alsoBefore}
            <a href="https://www.tajamar.es" target="_blank" rel="noopener noreferrer" className="hover:text-stone-700 dark:hover:text-[#c9beed] transition-colors">Tajamar</a>
            {a.currently.alsoAfter}
          </p>
        </section>

        {/* ── Outside the terminal (gallery) ────────────────────── */}
        <section>
          <h2 className="text-stone-900 dark:text-[#f0ecfd] font-semibold text-base mb-6" style={{ fontFamily: 'Capriola' }}>
            {a.gallery.heading}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {GALLERY.map(g => (
              <div key={g.key} className="group relative aspect-square overflow-hidden rounded-xl cursor-pointer border border-stone-200 dark:border-[#322d5a]">
                <img
                  src={g.image}
                  alt={a.gallery.captions[g.key]}
                  className={`w-full h-full object-cover ${g.position ?? ''} transition-transform duration-500 group-hover:scale-110`}
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <p className="absolute bottom-0 left-0 right-0 px-3 py-2.5 text-stone-100 text-xs font-medium translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  {a.gallery.captions[g.key]}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Feature sections ──────────────────────────────────── */}
        {FEATURES.map((f, i) => {
          const feature = a.features[f.key]
          // A feature's text may count the years of experience.
          const text = feature.text
          return (
            <section key={f.key}>
              <div className={`flex flex-col sm:flex-row gap-6 items-center ${i % 2 === 1 ? 'sm:flex-row-reverse' : ''}`}>
                <div className="w-full sm:w-2/5 aspect-[4/3] overflow-hidden rounded-xl border border-stone-200 dark:border-[#322d5a] shrink-0">
                  <img src={f.image} alt={feature.alt} className={`w-full h-full object-cover ${f.position ?? ''}`} loading="lazy" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-[#dd0000] dark:text-amber-400 tracking-widest uppercase mb-1">{feature.subtitle}</p>
                  <h3
                    className="text-stone-900 dark:text-[#f0ecfd] font-bold text-lg mb-3 leading-snug"
                    style={{ fontFamily: 'Capriola' }}
                  >
                    {feature.title}
                  </h3>
                  <p className="text-stone-600 dark:text-[#c9beed] text-sm leading-relaxed text-justify">
                    {typeof text === 'function' ? text(years) : text}
                  </p>
                </div>
              </div>
            </section>
          )
        })}

        {/* ── Personal project ──────────────────────────────────── */}
        <section>
          <h2 className="text-stone-900 dark:text-[#f0ecfd] font-semibold text-base mb-4" style={{ fontFamily: 'Capriola' }}>
            {a.project.heading}
          </h2>
          <p className="text-stone-600 dark:text-[#c9beed] text-sm leading-relaxed text-justify">
            {a.project.before}
            <a
              href="https://github.com/starseeker-code-public/joy-ai-rest-journaling-system"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[#dd0000] dark:text-amber-400 hover:underline"
            >
              Joy
            </a>
            {a.project.after}
          </p>
        </section>

        <div>
          <Link to={path('/')} className="text-[#798777] dark:text-amber-400 text-sm hover:text-[#4e6c50]/80 dark:hover:text-amber-300 transition-colors">
            {a.readTheBlog}
          </Link>
        </div>

      </div>

      <Footer />
    </div>
  )
}
