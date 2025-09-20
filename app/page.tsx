"use client"

import { useState, useMemo, useEffect } from "react"
import { SearchHeader } from "@/components/search-header"
import { FilterBar } from "@/components/filter-bar"
import { DateFilter } from "@/components/datetime-filter"
import { FoodList } from "@/components/food-list"
import { FoodDetailDrawer } from "@/components/food-detail-drawer"
import { ResponsiveContainer } from "@/components/responsive-container"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react"
import { useToast } from "@/components/toast-provider"
import { useFavoritesContext } from "@/components/favorites-context"
import { useFoods } from "@/hooks/use-foods"
import { useRestaurants } from "@/hooks/use-restaurants"
import { FoodItem } from "@/lib/database.types"
import { parseBusinessHours, isCurrentlyOpen, isOpenAtTime, timeStringToMinutes } from "@/lib/api/foods"
import { matchesKanaSearch } from "@/lib/kana-conversion"
import { filterMenusByAvailability } from "@/lib/menu-availability"
import { filterOutNGMenus } from "@/lib/ng-menu-filter"
import { filterByServiceType, filterByReservationSystem } from "@/lib/restaurant-filters"
import { format } from "date-fns"

// フォールバック用サンプルデータ
const FALLBACK_FOODS = [
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
    periods: [
      {
        period_start: "2025-01-01",
        period_end: null,
        restaurants_data: [
          {
            get_date: "2025-01-01",
            restaurantID: "1",
            pause_start_date: null,
            pause_end_date: null,
            sales_start_date: null,
            sales_end_date: null
          }
        ]
      }
    ]
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
    periods: [
      {
        period_start: "2025-01-01",
        period_end: "2025-12-31",
        restaurants_data: [
          {
            get_date: "2025-01-01",
            restaurantID: "2",
            pause_start_date: null,
            pause_end_date: null,
            sales_start_date: null,
            sales_end_date: null
          }
        ]
      }
    ]
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
  },
  {
    id: "5",
    title: "低アレルゲンカレー",
    price: "¥980",
    image: "/no-image-light.png",
    restaurant: "サンプルカフェ E",
    park: "tdl",
    restaurantId: "5",
    isFavorite: false,
  },
  {
    id: "6",
    title: "キャラメルスナック",
    price: "¥600",
    image: "/no-image-light.png",
    restaurant: "サンプルワゴン F",
    park: "tdl",
    restaurantId: "6",
    isFavorite: true,
  },
]


interface FilterState {
  park: string
  area: string
  priceRange: [number, number]
  sortBy: string
  serviceType: string
  reservationSystem: string
}

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [isFilterExpanded, setIsFilterExpanded] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedItem, setSelectedItem] = useState<FoodItem | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const { showToast } = useToast()
  const { toggleFavorite, isFavorite, getFavoriteItems, isLoaded } = useFavoritesContext()
  const { foods: apiFoods, isLoading, error, refetch } = useFoods()
  const { restaurants: apiRestaurants } = useRestaurants()
  const [filters, setFilters] = useState<FilterState>({
    park: "all",
    area: "all",
    priceRange: [0, 3000],
    sortBy: "recommended",
    serviceType: "all",
    reservationSystem: "all"
  })

  const itemsPerPage = 10

  // 日付フィルターのハンドラー
  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date)
    setCurrentPage(1) // ページをリセット
  }

  const foodsWithFavorites = useMemo(() => {
    if (!isLoaded) return apiFoods
    const foods = apiFoods.map((food) => ({
      ...food,
      isFavorite: isFavorite(food.id),
    }))
    
    
    return foods
  }, [isLoaded, isFavorite, apiFoods])

  const filteredFoods = useMemo(() => {
    let result = foodsWithFavorites
    const originalCount = result.length

    // NGメニューフィルター（最優先）
    result = filterOutNGMenus(result)

    // 日付フィルター
    // 日付が設定されている場合のみフィルタリングを実行
    if (selectedDate !== null) {
      const targetDate = selectedDate
      // 時刻フィルタリングは一時的に無効化
      result = filterMenusByAvailability(result, apiRestaurants, targetDate, undefined)
      
    }

    // お気に入りフィルター
    if (showFavoritesOnly) {
      result = getFavoriteItems(result)
    }

    // 検索クエリフィルター（ひらがな・カタカナ対応）
    if (searchQuery.trim()) {
      const query = searchQuery.trim()
      result = result.filter(
        (food) =>
          matchesKanaSearch(food.title, query) ||
          matchesKanaSearch(food.restaurant, query)
      )
    }

    // パークフィルター
    if (filters.park !== "all") {
      result = result.filter((food) => {
        if (!food.park) return false
        return food.park === filters.park
      })
    }

    // エリアフィルター（データベースのエリア情報を直接使用）
    if (filters.area !== "all") {
      result = result.filter((food) => {
        // 実際の実装では、レストランIDを使ってデータベースから直接エリア情報を取得する
        // 現在はレストラン名でのマッチングを使用（改善の余地あり）
        return food.restaurant.includes(filters.area)
      })
    }

    // サービス形態フィルター
    result = filterByServiceType(result, apiRestaurants, filters.serviceType)

    // 予約システムフィルター
    result = filterByReservationSystem(result, apiRestaurants, filters.reservationSystem)

    // 価格フィルター
    result = result.filter((food) => {
      const price = Number.parseInt(food.price.replace(/[¥,]/g, ""))
      return price >= filters.priceRange[0] && price <= filters.priceRange[1]
    })

    // ソート
    switch (filters.sortBy) {
      case "price-asc":
        result.sort((a, b) => {
          const priceA = Number.parseInt(a.price.replace(/[¥,]/g, ""))
          const priceB = Number.parseInt(b.price.replace(/[¥,]/g, ""))
          return priceA - priceB
        })
        break
      case "price-desc":
        result.sort((a, b) => {
          const priceA = Number.parseInt(a.price.replace(/[¥,]/g, ""))
          const priceB = Number.parseInt(b.price.replace(/[¥,]/g, ""))
          return priceB - priceA
        })
        break
      case "newest":
        result.reverse()
        break
      default:
        break
    }

    return result
  }, [foodsWithFavorites, searchQuery, showFavoritesOnly, filters, getFavoriteItems, selectedDate, apiRestaurants])

  const totalPages = Math.ceil(filteredFoods.length / itemsPerPage)
  const paginatedFoods = filteredFoods.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const handleFavoriteToggle = (id: string) => {
    const wasLiked = isFavorite(id)
    toggleFavorite(id)
    showToast(wasLiked ? "お気に入りから削除しました" : "お気に入りに追加しました", "success")
  }

  const handleFavoritesClick = () => {
    setShowFavoritesOnly(!showFavoritesOnly)
    setCurrentPage(1)
  }

  const handleCardClick = (item: FoodItem) => {
    setSelectedItem(item)
    setIsDrawerOpen(true)
  }

  const handleDrawerClose = () => {
    setIsDrawerOpen(false)
    setTimeout(() => setSelectedItem(null), 250) // アニメーション完了後にクリア
  }

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, filters, showFavoritesOnly])

  const handleRefresh = async () => {
    try {
      await refetch()
      showToast("メニュー情報を更新しました", "success")
    } catch (err) {
      showToast("更新に失敗しました", "error")
    }
  }

  const handleRetry = () => {
    handleRefresh()
  }

  return (
    <div className="min-h-screen bg-background">
      <SearchHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onFavoritesClick={handleFavoritesClick}
        showFavoritesOnly={showFavoritesOnly}
      />

      <div className="container mx-auto px-4 py-4">
        <DateFilter onDateChange={handleDateChange} />
      </div>

      <FilterBar
        filters={filters}
        onFiltersChange={setFilters}
        isExpanded={isFilterExpanded}
        onToggleExpanded={() => setIsFilterExpanded(!isFilterExpanded)}
        resultCount={filteredFoods.length}
      />

      <main>
        <ResponsiveContainer className="py-6">
          {error ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">データの読み込みに失敗しました</p>
              <Button variant="outline" onClick={handleRetry} className="flex items-center gap-2 bg-transparent">
                <RefreshCw className="w-4 h-4" />
                再試行
              </Button>
            </div>
          ) : isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-muted rounded-lg p-4 animate-pulse">
                  {/* Skeleton content */}
                </div>
              ))}
            </div>
          ) : filteredFoods.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                <span className="text-2xl">🍽️</span>
              </div>
              <p className="text-muted-foreground mb-4">条件に合うメニューは見つかりません</p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("")
                  setShowFavoritesOnly(false)
                  setFilters({
                    park: "all",
                    area: "all",
                    priceRange: [0, 3000],
                    sortBy: "recommended",
                  })
                  setCurrentPage(1)
                }}
              >
                条件をクリア
              </Button>
            </div>
          ) : (
            <>
              <FoodList
                foods={paginatedFoods}
                onFavoriteToggle={handleFavoriteToggle}
                onCardClick={handleCardClick}
                isLoading={isLoading}
              />

              {!isLoading && totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="min-w-[44px] h-[44px]"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="sr-only">前のページ</span>
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let page: number
                      if (totalPages <= 5) {
                        page = i + 1
                      } else if (currentPage <= 3) {
                        page = i + 1
                      } else if (currentPage >= totalPages - 2) {
                        page = totalPages - 4 + i
                      } else {
                        page = currentPage - 2 + i
                      }

                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className="min-w-[44px] h-[44px] p-0"
                          aria-label={`ページ${page}に移動`}
                        >
                          {page}
                        </Button>
                      )
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="min-w-[44px] h-[44px]"
                  >
                    <ChevronRight className="w-4 h-4" />
                    <span className="sr-only">次のページ</span>
                  </Button>
                </div>
              )}
            </>
          )}
        </ResponsiveContainer>
      </main>

      <FoodDetailDrawer item={selectedItem} isOpen={isDrawerOpen} onClose={handleDrawerClose} />
    </div>
  )
}
