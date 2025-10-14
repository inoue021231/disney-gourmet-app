"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import { useState } from "react"
import { FoodItem } from "@/lib/database.types"

interface FoodCardProps {
  item: FoodItem
  onFavoriteToggle: (id: string) => void
  onCardClick?: (item: FoodItem) => void
}

export function FoodCard({ item, onFavoriteToggle, onCardClick }: FoodCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  return (
    <Card
      className="overflow-hidden hover:shadow-xl hover:scale-[1.02] transition-all duration-200 cursor-pointer bg-card border-border group h-full flex flex-col"
      onClick={() => onCardClick?.(item)}
    >
      <div className="aspect-[4/3] relative overflow-hidden bg-muted">
        {!imageError ? (
          <img
            src={item.image || "/no-image-light.png"}
            alt={item.title}
            className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-105 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              setImageError(true)
              setImageLoaded(true)
            }}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <img 
              src="/no-image-light.png" 
              alt="画像なし" 
              className="w-full h-full object-contain opacity-60 dark:hidden" 
            />
            <img 
              src="/no-image-dark.png" 
              alt="画像なし" 
              className="w-full h-full object-contain opacity-60 hidden dark:block" 
            />
          </div>
        )}

        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        )}

        <Button
          variant="ghost"
          size="sm"
          className={`absolute top-2 right-2 p-2 bg-background/80 backdrop-blur-sm hover:bg-background/90 transition-all duration-200 ${
            item.isFavorite ? "text-accent" : "text-muted-foreground"
          }`}
          onClick={(e) => {
            e.stopPropagation()
            onFavoriteToggle(item.id)
          }}
        >
          <Heart className={`w-4 h-4 ${item.isFavorite ? "fill-current text-accent" : ""}`} />
        </Button>
      </div>

      <CardContent className="p-4 h-full flex flex-col">
        <div className="flex-1 space-y-3">
          <div className="space-y-2">
            <h3 className="font-semibold text-card-foreground line-clamp-2 leading-tight break-words">{item.title}</h3>
            <p className="text-lg font-bold text-primary">{item.price}</p>
          </div>

          <div className="space-y-1">
            {/* 販売中のパーク情報を表示 */}
            {item.availableParks && item.availableParks.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {item.availableParks.map((park, index) => (
                  <p key={index} className="text-xs font-medium text-primary">
                    {(park.toLowerCase() === 'tdl' || park.toUpperCase() === 'TDL') ? '東京ディズニーランド' : '東京ディズニーシー'}
                  </p>
                ))}
              </div>
            ) : item.park ? (
              <p className="text-xs font-medium text-primary">
                {(item.park.toLowerCase() === 'tdl' || item.park.toUpperCase() === 'TDL') ? '東京ディズニーランド' : '東京ディズニーシー'}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">パーク情報なし</p>
            )}
          </div>

        </div>

      </CardContent>
    </Card>
  )
}
