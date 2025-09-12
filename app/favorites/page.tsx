"use client"

import { useState, useMemo } from "react"
import { SearchHeader } from "@/components/search-header"
import { FilterBar } from "@/components/filter-bar"
import { FoodList } from "@/components/food-list"
import { FoodDetailDrawer } from "@/components/food-detail-drawer"
import { Button } from "@/components/ui/button"
import { Heart, Trash2 } from "lucide-react"
import { useFavoritesContext } from "@/components/favorites-context"
import { useToast } from "@/components/toast-provider"
import { useFoods } from "@/hooks/use-foods"
import { FoodItem } from "@/lib/database.types"

// フォールバック用データ（実際のアプリではAPIから取得）
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
  },
  {
    id: "3",
    title: "シナモンスナック",
    price: "¥350",
    image: "/no-image-light.png",
    restaurant: "サンプルワゴン C",
    park: "tdl",
    restaurantId: "3",
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
  },
  {
    id: "5",
    title: "低アレルゲンカレー",
    price: "¥980",
    image: "/no-image-light.png",
    restaurant: "サンプルカフェ E",
    park: "tdl",
    restaurantId: "5",
  },
  {
    id: "6",
    title: "キャラメルスナック",
    price: "¥600",
    image: "/no-image-light.png",
    restaurant: "サンプルワゴン F",
    park: "tdl",
    restaurantId: "6",
  },
]


interface FilterState {
  park: string
  area: string
  priceRange: [number, number]
  sortBy: string
  operatingStatus: string
  targetTime?: string
}

export default function FavoritesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isFilterExpanded, setIsFilterExpanded] = useState(false)
  const [selectedItem, setSelectedItem] = useState<FoodItem | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const { getFavoriteItems, toggleFavorite, favoriteCount, clearAllFavorites } =
    useFavoritesContext()
  const { showToast } = useToast()
  const [filters, setFilters] = useState<FilterState>({
    park: "all",
    area: "all",
    priceRange: [0, 3000],
    sortBy: "recommended",
    operatingStatus: "all",
  })

  const { foods: apiFoods, isLoading } = useFoods()

  const favoriteItems = useMemo(() => {
    const sourceData = apiFoods.length > 0 ? apiFoods : FALLBACK_FOODS
    const favorites = getFavoriteItems(sourceData).map((item) => ({ ...item, isFavorite: true }))
    return favorites
  }, [getFavoriteItems, apiFoods])

  const filteredFavorites = useMemo(() => {
    let result = favoriteItems

    // 検索クエリフィルター
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      result = result.filter(
        (food) =>
          food.title.toLowerCase().includes(query) ||
          food.restaurant.toLowerCase().includes(query)
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
        return food.restaurant.includes(filters.area)
      })
    }

    // 営業時間フィルター
    if (filters.operatingStatus !== "all") {
      result = result.filter((food) => {
        if (filters.operatingStatus === "open-now") {
          return true // フォールバック
        } else if (filters.operatingStatus === "open-at-time" && filters.targetTime) {
          return true // フォールバック
        }
        return true
      })
    }


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
      default:
        break
    }

    return result
  }, [favoriteItems, searchQuery, filters])

  const handleFavoriteToggle = (id: string) => {
    toggleFavorite(id)
    showToast("お気に入りから削除しました", "success")
  }

  const handleCardClick = (item: FoodItem) => {
    setSelectedItem(item)
    setIsDrawerOpen(true)
  }

  const handleDrawerClose = () => {
    setIsDrawerOpen(false)
    setTimeout(() => setSelectedItem(null), 250)
  }


  const handleClearAll = () => {
    if (confirm("すべてのお気に入りを削除しますか？この操作は取り消せません。")) {
      clearAllFavorites()
      showToast("すべてのお気に入りを削除しました", "success")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <SearchHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onFavoritesClick={() => {}}
        showFavoritesOnly={true}
      />

      <FilterBar
        filters={filters}
        onFiltersChange={setFilters}
        isExpanded={isFilterExpanded}
        onToggleExpanded={() => setIsFilterExpanded(!isFilterExpanded)}
        resultCount={filteredFavorites.length}
      />

      <main className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-accent fill-current" />
            <h1 className="text-xl font-bold text-foreground">お気に入り</h1>
            <span className="text-sm text-muted-foreground">({favoriteCount}件)</span>
          </div>

          {favoriteCount > 0 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearAll}
                className="flex items-center gap-1 text-destructive hover:text-destructive bg-transparent"
              >
                <Trash2 className="w-3 h-3" />
                全削除
              </Button>
            </div>
          )}
        </div>

        {filteredFavorites.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
              <Heart className="w-12 h-12 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground mb-2">
              {favoriteCount === 0 ? "お気に入りに登録されたメニューはありません" : "条件に合うお気に入りはありません"}
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              {favoriteCount === 0
                ? "気になるメニューを見つけてお気に入りに追加してみましょう"
                : "検索条件を変更してみてください"}
            </p>
            <Button variant="outline" onClick={() => (window.location.href = "/")}>
              メニューを探す
            </Button>
          </div>
        ) : (
          <FoodList foods={filteredFavorites} onFavoriteToggle={handleFavoriteToggle} onCardClick={handleCardClick} />
        )}
      </main>

      <FoodDetailDrawer item={selectedItem} isOpen={isDrawerOpen} onClose={handleDrawerClose} />
    </div>
  )
}
