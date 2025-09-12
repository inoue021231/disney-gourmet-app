import { useState, useEffect } from 'react'
import { FoodItem } from '@/lib/database.types'

interface UseFoodsResult {
  foods: FoodItem[]
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useFoods(): UseFoodsResult {
  const [foods, setFoods] = useState<FoodItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchFoods = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/foods')
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch foods')
      }

      setFoods(data.foods || [])
    } catch (err) {
      console.error('Error fetching foods:', err)
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
      
      // エラー時はサンプルデータを使用
      setFoods(getSampleFoods())
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchFoods()
  }, [])

  return {
    foods,
    isLoading,
    error,
    refetch: fetchFoods
  }
}

// フォールバック用のサンプルデータ
function getSampleFoods(): FoodItem[] {
  return [
    {
      id: "1",
      title: "特製ハンバーガーセット",
      price: "¥1,200",
      image: "/no-image-light.png",
      period: "2025/09/01〜2025/10/31",
      restaurant: "サンプルレストラン A",
      park: "tdl",
      restaurantId: "1",
      isFavorite: false,
    },
    {
      id: "2",
      title: "季節限定プリン",
      price: "¥680",
      image: "/no-image-light.png",
      period: "2025/09/15〜2025/10/31",
      restaurant: "サンプルカフェ B",
      park: "tdl",
      restaurantId: "2",
      isFavorite: true,
    },
    {
      id: "3",
      title: "シナモンスナック",
      price: "¥350",
      image: "/no-image-light.png",
      restaurant: "サンプルワゴン C",
      park: "tdl",
      restaurantId: "3",
      isFavorite: false,
    },
    {
      id: "4",
      title: "スペシャルドリンク",
      price: "¥520",
      image: "/no-image-light.png",
      period: "2025/11/01〜2026/02/28",
      restaurant: "サンプルレストラン D",
      park: "tds",
      restaurantId: "4",
      isFavorite: false,
    }
  ]
}
