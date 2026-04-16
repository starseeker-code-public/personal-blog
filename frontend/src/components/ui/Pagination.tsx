interface PaginationProps {
  page: number
  total: number
  pageSize: number
  onPageChange: (page: number) => void
}

export function Pagination({ page, total, pageSize, onPageChange }: PaginationProps) {
  const totalPages = Math.ceil(total / pageSize)
  if (totalPages <= 1) return null

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  return (
    <nav className="flex items-center justify-center gap-2 mt-12" aria-label="Pagination">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="px-3 py-1.5 rounded-lg border border-white/10 text-slate-400 text-sm
          hover:border-indigo-500 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        ←
      </button>

      {pages.map(p => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
            p === page
              ? 'bg-indigo-600 text-white border border-indigo-500'
              : 'border border-white/10 text-slate-400 hover:border-indigo-500 hover:text-white'
          }`}
        >
          {p}
        </button>
      ))}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="px-3 py-1.5 rounded-lg border border-white/10 text-slate-400 text-sm
          hover:border-indigo-500 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        →
      </button>
    </nav>
  )
}
