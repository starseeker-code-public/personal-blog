import { Link } from 'react-router-dom'
import { SITE } from '../data'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import { Stars, Section, SectionHeading, Divider } from '../components/ui'
import { IcoGithub, IcoLinkedin, IcoMail } from '../components/icons'

export default function About() {
  return (
    <div className="min-h-screen bg-slate-950 font-sans">
      <Stars />
      <Navbar />

      <Section id="about">
        <div className="pt-8">
          <SectionHeading>About</SectionHeading>

          <div className="space-y-6 text-slate-400 text-sm sm:text-base leading-relaxed max-w-2xl">
            <p>
              I'm{' '}
              <span className="keyword-glow">{SITE.author.name}</span> — a
              Python backend engineer who writes about what I build and the lessons I learn along the way.
            </p>

            <p>
              Most of my work lives at the intersection of{' '}
              <span className="keyword-glow">FastAPI</span>,{' '}
              <span className="keyword-glow">PostgreSQL</span>, and{' '}
              <span className="keyword-glow">distributed systems</span>. I care about correctness,
              observability, and shipping software that actually works in production.
            </p>

            <p>
              This blog is where I document patterns I've found useful, mistakes worth avoiding,
              and the occasional deep-dive into a library or concept that deserves more attention.
            </p>

            <p>
              {SITE.tagline}
            </p>
          </div>

          <div className="flex flex-wrap gap-4 mt-10">
            <a
              href={SITE.social.github}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 text-slate-300 hover:border-indigo-500 hover:text-white text-sm transition-colors"
            >
              <IcoGithub />
              GitHub
            </a>
            <a
              href={SITE.social.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 text-slate-300 hover:border-indigo-500 hover:text-white text-sm transition-colors"
            >
              <IcoLinkedin />
              LinkedIn
            </a>
            <a
              href={`mailto:${SITE.author.email}`}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 text-slate-300 hover:border-indigo-500 hover:text-white text-sm transition-colors"
            >
              <IcoMail />
              Email
            </a>
          </div>

          <Divider />

          <div className="mt-10">
            <h3 className="text-white font-medium text-sm mb-4" style={{ fontFamily: 'Exo 2' }}>
              ◈ Tech I write about
            </h3>
            <div className="flex flex-wrap gap-2">
              {['Python', 'FastAPI', 'PostgreSQL', 'Redis', 'Docker', 'asyncio', 'SQLAlchemy', 'React', 'TypeScript'].map(t => (
                <span
                  key={t}
                  className="text-xs px-2 py-1 rounded-full bg-indigo-900/60 text-indigo-300 border border-indigo-700/50"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-10">
            <Link
              to="/"
              className="text-indigo-400 text-sm hover:text-indigo-300 transition-colors"
            >
              ← Read the blog
            </Link>
          </div>
        </div>
      </Section>

      <Footer />
    </div>
  )
}
