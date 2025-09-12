"use client"

import { useState, useEffect, useCallback } from "react"

interface FoodItem {
  id: string
  title: string
  price: string
  description: string
  image: string
  tags: string[]
  period?: string
  restaurant: string
  isFavorite?: boolean
}

const FAVORITES_STORAGE_KEY = "theme-park-food-favorites"

export function useFavorites() {
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set())
  const [isLoaded, setIsLoaded] = useState(false)

  // ローカルストレージからお気に入りを読み込み
  useEffect(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_STORAGE_KEY)
      if (stored) {
        const ids = JSON.parse(stored) as string[]
        setFavoriteIds(new Set(ids))
      }
    } catch (error) {
      console.error("Failed to load favorites from localStorage:", error)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  // ローカルストレージに保存
  const saveFavorites = useCallback((ids: Set<string>) => {
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(Array.from(ids)))
    } catch (error) {
      console.error("Failed to save favorites to localStorage:", error)
    }
  }, [])

  // お気に入りの追加・削除
  const toggleFavorite = useCallback(
    (id: string) => {
      setFavoriteIds((prev) => {
        const newIds = new Set(prev)
        if (newIds.has(id)) {
          newIds.delete(id)
        } else {
          newIds.add(id)
        }
        saveFavorites(newIds)
        return newIds
      })
    },
    [saveFavorites],
  )

  // お気に入り状態の確認
  const isFavorite = useCallback((id: string) => favoriteIds.has(id), [favoriteIds])

  // お気に入りアイテムのフィルタリング
  const getFavoriteItems = useCallback(
    (items: FoodItem[]) => {
      return items.filter((item) => favoriteIds.has(item.id))
    },
    [favoriteIds],
  )

  // お気に入り件数
  const favoriteCount = favoriteIds.size

  // 全お気に入りをクリア
  const clearAllFavorites = useCallback(() => {
    setFavoriteIds(new Set())
    saveFavorites(new Set())
  }, [saveFavorites])

  return {
    favoriteIds,
    isLoaded,
    toggleFavorite,
    isFavorite,
    getFavoriteItems,
    favoriteCount,
    clearAllFavorites,
  }
}
