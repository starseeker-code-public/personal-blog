import { Link } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import { Stars } from '../components/ui'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 font-sans">
      <Stars />
      <Navbar />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-4">
        <p className="text-violet-400 text-xs tracking-[0.3em] uppercase mb-4">404</p>
        <h1 className="text-5xl sm:text-7xl font-bold text-white mb-6 font-capriola">
          Not{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-violet-400">
            Found
          </span>
        </h1>
        <p className="text-slate-400 max-w-sm mb-10">
          This page doesn't exist. Maybe the post was moved or deleted.
        </p>
        <Link
          to="/"
          className="px-6 py-3 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors"
        >
          Back to blog
        </Link>
      </div>

      <Footer />
    </div>
  )
}
