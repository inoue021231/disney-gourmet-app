"use client"

import { useState, useEffect } from 'react'
import { getAreas } from '@/lib/api/foods'

export interface AreaOption {
  value: string
  label: string
  park: string
}

export function useAreas() {
  const [areas, setAreas] = useState<AreaOption[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAreas = async () => {
      try {
        setIsLoading(true)
        const fetchedAreas = await getAreas()
        setAreas(fetchedAreas)
        setError(null)
      } catch (err) {
        console.error('Failed to fetch areas:', err)
        setError('エリア情報の取得に失敗しました')
        // フォールバックデータ
        setAreas([
          { value: "サンプルエリア A", label: "🏰 サンプルエリア A", park: "tdl" },
          { value: "サンプルエリア B", label: "🏰 サンプルエリア B", park: "tdl" },
          { value: "サンプルエリア C", label: "🏰 サンプルエリア C", park: "tdl" },
          { value: "サンプルエリア D", label: "🌊 サンプルエリア D", park: "tds" },
          { value: "サンプルエリア E", label: "🌊 サンプルエリア E", park: "tds" },
        ])
      } finally {
        setIsLoading(false)
      }
    }

    fetchAreas()
  }, [])

  const getAreasByPark = (park: string) => {
    if (park === 'all') return areas
    return areas.filter(area => area.park === park)
  }

  return {
    areas,
    isLoading,
    error,
    getAreasByPark
  }
}

