interface SectionProps {
  id: string
  children: React.ReactNode
  className?: string
}

export function Section({ id, children, className = '' }: SectionProps) {
  return (
    <section id={id} className={`relative z-10 px-4 py-20 max-w-4xl mx-auto ${className}`}>
      {children}
    </section>
  )
}
