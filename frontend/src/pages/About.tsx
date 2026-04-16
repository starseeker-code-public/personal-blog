import { SITE } from '../data'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import {
  IcoGithub, IcoLinkedin, IcoDevTo, IcoGlobe,
} from '../components/icons'

const SOCIALS = [
  { key: 'portfolio', label: 'Portfolio', icon: <IcoGlobe />,    href: SITE.portfolio },
  { key: 'github',    label: 'GitHub',    icon: <IcoGithub />,   href: SITE.social.github },
  { key: 'linkedin',  label: 'LinkedIn',  icon: <IcoLinkedin />, href: SITE.social.linkedin },
  { key: 'devto',     label: 'Dev.to',    icon: <IcoDevTo />,    href: SITE.social.devto },
]

const GALLERY = [
  { url: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=600&q=80', caption: 'The night sky' },
  { url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&q=80', caption: 'Building things' },
  { url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80', caption: 'Spain' },
  { url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&q=80', caption: 'Teaching' },
  { url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&q=80', caption: 'Late nights' },
  { url: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=600&q=80', caption: 'Traveling' },
]

const FEATURES = [
  {
    subtitle: 'Engineering',
    title: 'Where Hard Problems Live',
    text: 'Seven years building distributed systems in Python. APIs, microservices, event-driven architectures — and the particular education that only production failures can give. I write about what worked, what broke, and why.',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80',
    alt: 'Circuit board close-up',
  },
  {
    subtitle: 'Hobbies',
    title: 'After the Terminal Closes',
    text: 'A Dobsonian telescope, the Messier catalogue, and too many clear nights. Competitive coding to keep the instinct sharp. Learning German — slowly, stubbornly. Teaching Python because explaining it out loud is the only real test of understanding.',
    image: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800&q=80',
    alt: 'Starry night sky',
  },
  {
    subtitle: 'Life & Lifestyle',
    title: 'The Human Behind the Code',
    text: 'Based in Albacete, working remotely. Bilingual in Spanish and English. Opinions formed over years of doing, not just reading. This blog is my honest record — the engineering, the hobbies, and everything in between.',
    image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80',
    alt: 'Landscape and lifestyle',
  },
]

export default function About() {
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
            Hey, I'm Joaquín.
          </h1>

          <div className="space-y-4 text-stone-700 dark:text-[#c9beed] text-sm sm:text-base leading-relaxed text-justify">
            <p>
              By day I'm a senior backend engineer at{' '}
              <a href="https://www.allot.com" target="_blank" rel="noopener noreferrer" className="text-[#dd0000] dark:text-amber-400 hover:underline">Allot</a>
              , building cybersecurity infrastructure that processes ISP traffic at scale.
              Seven years of distributed systems, Python, and the particular education you only get from production failures.
            </p>
            <p>
              By night I point a telescope at the sky and wonder what's out there.
            </p>
            <p>
              This is my personal corner of the internet. Not a portfolio, not a CV — just a place to write honestly
              about engineering, hobbies, and life in a mid-sized Spanish city.
            </p>
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
            Currently
          </h2>
          <div className="rounded-xl border border-amber-400/50 dark:border-amber-500/40 bg-amber-50 dark:bg-amber-500/10 p-5">
            <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
              <div>
                <span className="text-stone-900 dark:text-[#f0ecfd] text-sm font-medium">Senior Python Backend Developer</span>
                <span className="text-stone-500 dark:text-[#8b7db8] text-sm"> at </span>
                <a href="https://www.allot.com" target="_blank" rel="noopener noreferrer" className="text-[#dd0000] dark:text-amber-400 text-sm hover:underline">
                  Allot
                </a>
              </div>
              <span className="text-[#798777] dark:text-amber-400 text-xs flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400" />
                May 2025 – Present
              </span>
            </div>
            <p className="text-stone-600 dark:text-[#c9beed] text-xs leading-relaxed text-justify">
              Part of the ASM team — a cybersecurity SaaS platform sold to ISPs worldwide.
              Microservices in Python, Kafka, Redis, MongoDB. Processing millions of security events per second.
            </p>
          </div>
          <p className="text-stone-500 dark:text-[#8b7db8] text-xs mt-3 pl-1">
            Also teach advanced Python at{' '}
            <a href="https://www.tajamar.es" target="_blank" rel="noopener noreferrer" className="hover:text-stone-700 dark:hover:text-[#c9beed] transition-colors">Tajamar</a>
            {' '}and mentor at PyLadies Madrid.
          </p>
        </section>

        {/* ── Outside the terminal (gallery) ────────────────────── */}
        <section>
          <h2 className="text-stone-900 dark:text-[#f0ecfd] font-semibold text-base mb-6" style={{ fontFamily: 'Capriola' }}>
            Outside the terminal
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {GALLERY.map((g, i) => (
              <div key={i} className="group relative aspect-square overflow-hidden rounded-xl cursor-pointer border border-stone-200 dark:border-[#322d5a]">
                <img
                  src={g.url}
                  alt={g.caption}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <p className="absolute bottom-0 left-0 right-0 px-3 py-2.5 text-stone-100 text-xs font-medium translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  {g.caption}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Feature sections ──────────────────────────────────── */}
        {FEATURES.map((f, i) => (
          <section key={f.subtitle}>
            <div className={`flex flex-col sm:flex-row gap-6 items-center ${i % 2 === 1 ? 'sm:flex-row-reverse' : ''}`}>
              <div className="w-full sm:w-2/5 aspect-[4/3] overflow-hidden rounded-xl border border-stone-200 dark:border-[#322d5a] shrink-0">
                <img src={f.image} alt={f.alt} className="w-full h-full object-cover" loading="lazy" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-[#dd0000] dark:text-amber-400 tracking-widest uppercase mb-1">{f.subtitle}</p>
                <h3
                  className="text-stone-900 dark:text-[#f0ecfd] font-bold text-lg mb-3 leading-snug"
                  style={{ fontFamily: 'Capriola' }}
                >
                  {f.title}
                </h3>
                <p className="text-stone-600 dark:text-[#c9beed] text-sm leading-relaxed text-justify">{f.text}</p>
              </div>
            </div>
          </section>
        ))}

        {/* ── Personal project ──────────────────────────────────── */}
        <section>
          <h2 className="text-stone-900 dark:text-[#f0ecfd] font-semibold text-base mb-4" style={{ fontFamily: 'Capriola' }}>
            A Tool Nobody Asked For
          </h2>
          <p className="text-stone-600 dark:text-[#c9beed] text-sm leading-relaxed text-justify">
            I'm building <span className="text-stone-900 dark:text-[#f0ecfd] font-medium">ObsidianSky</span> — a personal observation log for amateur astronomers. The premise is embarrassingly simple: two years into working through the Messier catalogue, I was still tracking sessions in a spreadsheet. That felt wrong for someone who writes distributed systems for a living. The goal is a lightweight Python backend with a clean interface to log sessions, sky conditions, equipment notes, and deep-sky object data — not for anyone else, just for me. Side projects are how I test ideas without the pressure of production. This one is half-finished and will probably always be.
          </p>
        </section>

        <div>
          <a href="/" className="text-[#798777] dark:text-amber-400 text-sm hover:text-[#4e6c50]/80 dark:hover:text-amber-300 transition-colors">
            ← Read the blog
          </a>
        </div>

      </div>

      <Footer />
    </div>
  )
}
