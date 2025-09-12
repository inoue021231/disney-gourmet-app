"use client"

import { createContext, useContext, type ReactNode } from "react"
import { useFavorites } from "@/hooks/use-favorites"

interface FavoritesContextType {
  favoriteIds: Set<string>
  isLoaded: boolean
  toggleFavorite: (id: string) => void
  isFavorite: (id: string) => boolean
  getFavoriteItems: (items: any[]) => any[]
  favoriteCount: number
  exportFavorites: () => void
  importFavorites: (file: File) => Promise<boolean>
  clearAllFavorites: () => void
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

export function useFavoritesContext() {
  const context = useContext(FavoritesContext)
  if (!context) {
    throw new Error("useFavoritesContext must be used within a FavoritesProvider")
  }
  return context
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const favorites = useFavorites()

  return <FavoritesContext.Provider value={favorites}>{children}</FavoritesContext.Provider>
}
