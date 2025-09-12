"use client"

import { FoodCard } from "./food-card"
import { FoodCardSkeleton } from "./food-card-skeleton"
import { FoodItem } from "@/lib/database.types"

interface FoodListProps {
  foods: FoodItem[]
  onFavoriteToggle: (id: string) => void
  onCardClick?: (item: FoodItem) => void
  isLoading?: boolean
  className?: string
}

export function FoodList({ foods, onFavoriteToggle, onCardClick, isLoading, className }: FoodListProps) {
  if (isLoading) {
    return (
      <div className={`grid gap-6 ${className || ""}`} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <FoodCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  return (
    <div className={`grid gap-6 ${className || ""}`} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
      {foods.map((food) => (
        <FoodCard key={food.id} item={food} onFavoriteToggle={onFavoriteToggle} onCardClick={onCardClick} />
      ))}
    </div>
  )
}
