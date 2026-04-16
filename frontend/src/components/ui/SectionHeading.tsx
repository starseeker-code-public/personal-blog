export function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="text-[1.5rem] sm:text-[1.8rem] md:text-[2.4rem] font-bold text-white mb-10 flex items-center gap-3 tracking-[0.05em]"
      style={{ fontFamily: 'Exo 2' }}
    >
      <span className="text-indigo-400">◈</span>
      <span>{children}</span>
    </h2>
  )
}
