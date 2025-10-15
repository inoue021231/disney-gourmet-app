import type { ReactNode } from "react"
import { useMobileDetection } from "@/hooks/use-mobile-detection"

interface ResponsiveGridProps {
  children: ReactNode
  className?: string
}

export function ResponsiveGrid({ children, className = "" }: ResponsiveGridProps) {
  const isMobile = useMobileDetection()
  
  // モバイルでは3列表示、デスクトップでは横幅いっぱいに表示
  const gridClasses = isMobile 
    ? 'grid-cols-3'
    : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
  
  return (
    <div className={`grid gap-4 sm:gap-6 ${gridClasses} ${className}`}>
      {children}
    </div>
  )
}
