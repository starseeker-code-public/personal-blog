import { SITE } from '../data'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import {
  IcoGithub, IcoLinkedin, IcoMail,
  IcoInstagram, IcoDevTo, IcoCodewars, IcoGlobe,
} from '../components/icons'

const SOCIALS = [
  { key: 'portfolio', label: 'Portfolio',  icon: <IcoGlobe />,     href: SITE.portfolio },
  { key: 'github',    label: 'GitHub',     icon: <IcoGithub />,    href: SITE.social.github },
  { key: 'linkedin',  label: 'LinkedIn',   icon: <IcoLinkedin />,  href: SITE.social.linkedin },
  { key: 'devto',     label: 'Dev.to',     icon: <IcoDevTo />,     href: SITE.social.devto },
  { key: 'codewars',  label: 'Codewars',   icon: <IcoCodewars />,  href: SITE.social.codewars },
  { key: 'instagram', label: 'Instagram',  icon: <IcoInstagram />, href: SITE.social.instagram },
  { key: 'email',     label: 'Email',      icon: <IcoMail />,      href: `mailto:${SITE.author.email}` },
]

const AREAS = [
  {
    emoji: '⚙️',
    title: 'Engineering',
    desc: 'The craft I do for a living. Distributed systems, APIs, databases, the hard lessons production teaches you. Honest write-ups — including the mistakes.',
  },
  {
    emoji: '🔭',
    title: 'Hobbies',
    desc: 'Pointing telescopes at the night sky. Competitive coding. Learning languages. Whatever I\'m obsessing over this month.',
  },
  {
    emoji: '🌿',
    title: 'Personal Life',
    desc: 'Living and working remotely from Albacete, Spain. Opinions formed over years. Things I wish I\'d known sooner.',
  },
]

const GALLERY = [
  { url: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=600&q=80', caption: 'The night sky' },
  { url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&q=80', caption: 'Building things' },
  { url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80', caption: 'Spain' },
  { url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&q=80', caption: 'Teaching' },
  { url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&q=80', caption: 'Late nights' },
  { url: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=600&q=80', caption: 'Traveling' },
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

          <div className="space-y-4 text-stone-700 dark:text-[#c9beed] text-sm sm:text-base leading-relaxed">
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

          {/* Social icons carousel */}
          <div className="mt-8 overflow-hidden carousel-fade">
            <div
              className="flex items-center gap-8"
              style={{ animation: 'carousel-scroll 18s linear infinite', width: 'max-content' }}
            >
              {[...SOCIALS, ...SOCIALS].map((s, i) => (
                <a
                  key={`${s.key}-${i}`}
                  href={s.href}
                  target={s.key === 'email' ? undefined : '_blank'}
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

        {/* ── What I write about ────────────────────────────────── */}
        <section>
          <h2 className="text-stone-900 dark:text-[#f0ecfd] font-semibold text-base mb-6" style={{ fontFamily: 'Capriola' }}>
            What I write about
          </h2>
          <div className="space-y-4">
            {AREAS.map(a => (
              <div key={a.title} className="flex gap-4 p-4 rounded-xl border border-stone-300 dark:border-[#322d5a] bg-[#e4ddba]/40 dark:bg-[#1a1735]/60 hover:border-stone-400 dark:hover:border-[#4a4480] transition-colors">
                <span className="text-xl shrink-0 mt-0.5">{a.emoji}</span>
                <div>
                  <p className="text-stone-900 dark:text-[#f0ecfd] text-sm font-medium mb-1">{a.title}</p>
                  <p className="text-stone-500 dark:text-[#8b7db8] text-sm leading-relaxed">{a.desc}</p>
                </div>
              </div>
            ))}
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
            <p className="text-stone-600 dark:text-[#c9beed] text-xs leading-relaxed">
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

        {/* ── Gallery ───────────────────────────────────────────── */}
        <section>
          <h2 className="text-stone-900 dark:text-[#f0ecfd] font-semibold text-base mb-6" style={{ fontFamily: 'Capriola' }}>
            Gallery
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
