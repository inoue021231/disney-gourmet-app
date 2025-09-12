import type { ReactNode } from "react"

interface ResponsiveGridProps {
  children: ReactNode
  className?: string
}

export function ResponsiveGrid({ children, className = "" }: ResponsiveGridProps) {
  return (
    <div className={`grid gap-4 sm:gap-6 ${className}`} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
      {children}
    </div>
  )
}
