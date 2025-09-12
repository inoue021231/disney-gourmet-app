import { useState, useEffect } from 'react'
import { RestaurantInfo } from '@/lib/database.types'

interface UseRestaurantsResult {
  restaurants: RestaurantInfo[]
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useRestaurants(): UseRestaurantsResult {
  const [restaurants, setRestaurants] = useState<RestaurantInfo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRestaurants = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/restaurants')
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch restaurants')
      }

      setRestaurants(data.restaurants || [])
    } catch (err) {
      console.error('Error fetching restaurants:', err)
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
      
      // エラー時はサンプルデータを使用
      setRestaurants(getSampleRestaurants())
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchRestaurants()
  }, [])

  return {
    restaurants,
    isLoading,
    error,
    refetch: fetchRestaurants
  }
}

// フォールバック用のサンプルデータ
function getSampleRestaurants(): RestaurantInfo[] {
  return [
    {
      id: "1",
      name: "サンプルレストラン A",
      park: "TDL",
      area: "サンプルエリア A",
      business_hours: "9:00 - 21:00",
      type: "レストラン",
      description: "洋食を中心としたメニューが楽しめるレストラン",
      specialties: ["ハンバーガーセット", "パスタ", "サラダ"],
      image: "/no-image-light.png",
    },
    {
      id: "2",
      name: "サンプルカフェ B",
      park: "TDL",
      area: "サンプルエリア A",
      business_hours: "8:00 - 22:00",
      type: "カフェ",
      description: "デザートとドリンクが充実したカフェ",
      specialties: ["季節限定デザート", "コーヒー", "ケーキ"],
      image: "/no-image-light.png",
    }
  ]
}
