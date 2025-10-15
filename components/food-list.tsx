"use client"

import { FoodCard } from "./food-card"
import { FoodCardSkeleton } from "./food-card-skeleton"
import { FoodItem } from "@/lib/database.types"
import { useMobileDetection } from "@/hooks/use-mobile-detection"

interface FoodListProps {
  foods: FoodItem[]
  onFavoriteToggle: (id: string) => void
  onCardClick?: (item: FoodItem) => void
  isLoading?: boolean
  className?: string
}

export function FoodList({ foods, onFavoriteToggle, onCardClick, isLoading, className }: FoodListProps) {
  const isMobile = useMobileDetection()
  
  // モバイルでは3列表示、デスクトップでは横幅いっぱいに表示
  const gridClasses = isMobile 
    ? 'grid-cols-3'
    : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'

  if (isLoading) {
    return (
      <div className={`grid gap-6 ${gridClasses} ${className || ""}`}>
        {Array.from({ length: 6 }).map((_, i) => (
          <FoodCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  return (
    <div className={`grid gap-6 ${gridClasses} ${className || ""}`}>
      {foods.map((food) => (
        <FoodCard key={food.id} item={food} onFavoriteToggle={onFavoriteToggle} onCardClick={onCardClick} />
      ))}
    </div>
  )
}
