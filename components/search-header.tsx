"use client"

import type React from "react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ViewToggleButton } from "@/components/view-toggle-button"
import { Search, Heart, X } from "lucide-react"
import { useState, useRef } from "react"

interface SearchHeaderProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  onFavoritesClick: () => void
  showFavoritesOnly: boolean
}

export function SearchHeader({ searchQuery, onSearchChange, onFavoritesClick, showFavoritesOnly }: SearchHeaderProps) {
  const [isComposing, setIsComposing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isComposing) {
      inputRef.current?.blur()
    }
  }

  const handleCompositionStart = () => {
    setIsComposing(true)
  }

  const handleCompositionEnd = () => {
    setIsComposing(false)
  }

  const clearSearch = () => {
    onSearchChange("")
    inputRef.current?.focus()
  }

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center gap-3">
          <h1 className="text-lg sm:text-xl font-bold text-primary whitespace-nowrap">グルメ検索</h1>

          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              ref={inputRef}
              type="text"
              placeholder="キーワードを入力..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onCompositionStart={handleCompositionStart}
              onCompositionEnd={handleCompositionEnd}
              className="pl-10 pr-10 bg-input border-border text-sm sm:text-base w-full"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSearch}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 p-1 h-6 w-6"
              >
                <X className="w-3 h-3" />
              </Button>
            )}
          </div>

          <ViewToggleButton />
          
          <Button
            variant={showFavoritesOnly ? "default" : "ghost"}
            size="sm"
            onClick={onFavoritesClick}
            className="p-2 min-w-[44px] h-[44px]"
          >
            <Heart className={`w-4 h-4 ${showFavoritesOnly ? "fill-current" : ""}`} />
            <span className="sr-only">お気に入り</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
