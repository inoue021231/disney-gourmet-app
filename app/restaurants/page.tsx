"use client"

import { useState, useMemo, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Search, ExternalLink, Clock, ChevronLeft, ChevronRight, Building2, Timer } from "lucide-react"
import { ViewToggleButton } from "@/components/view-toggle-button"
import { useRestaurants } from "@/hooks/use-restaurants"
import { useAreas } from "@/hooks/use-areas"
import { useMobileDetection } from "@/hooks/use-mobile-detection"
import { parseBusinessHours, isCurrentlyOpen, isOpenAtTime, timeStringToMinutes } from "@/lib/api/foods"
import { matchesKanaSearch } from "@/lib/kana-conversion"
import { getAvailableServiceTypes, getReservationSystemOptions } from "@/lib/restaurant-filters"

const FALLBACK_RESTAURANTS = [
  {
    id: "1",
    name: "サンプルレストラン A",
    park: "TDL",
    area: "サンプルエリア A",
    type: "レストラン",
    description: "サンプルレストランの説明文です。",
    business_hours: "10:00 - 19:30",
    specialties: ["ハンバーガー", "フライドポテト", "ドリンク"],
    image: "/no-image-light.png",
  },
  {
    id: "2",
    name: "サンプルカフェ B",
    park: "TDS",
    area: "サンプルエリア B",
    type: "カフェ",
    description: "サンプルカフェの説明文です。",
    business_hours: "09:00 - 20:00",
    specialties: ["コーヒー", "ケーキ", "サンドイッチ"],
    image: "/no-image-light.png",
  },
  {
    id: "3",
    name: "サンプルワゴン C",
    park: "TDL",
    area: "サンプルエリア C",
    type: "ワゴン",
    description: "サンプルワゴンの説明文です。",
    business_hours: "ー",
    specialties: ["スナック", "ドリンク"],
    image: "/no-image-light.png",
  },
  {
    id: "4",
    name: "サンプルレストラン D",
    park: "TDS",
    area: "サンプルエリア D",
    type: "レストラン",
    description: "サンプルレストランの説明文です。",
    business_hours: "11:00 - 21:00",
    specialties: ["パスタ", "低アレルゲンメニュー", "コース料理"],
    image: "/no-image-light.png",
  },
]

export default function RestaurantsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPark, setSelectedPark] = useState("all")
  const [selectedArea, setSelectedArea] = useState("all")
  const [selectedServiceType, setSelectedServiceType] = useState("all")
  const [selectedReservationSystem, setSelectedReservationSystem] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const { restaurants: apiRestaurants, isLoading } = useRestaurants()
  const { areas, getAreasByPark } = useAreas()
  const isMobile = useMobileDetection()

  // パーク変更時にエリアをリセット
  const handleParkChange = useCallback((park: string) => {
    setSelectedPark(park)
    setSelectedArea("all")
    setCurrentPage(1) // ページをリセット
  }, [])


  // パークに応じたエリア選択肢を取得
  const availableAreas = getAreasByPark(selectedPark)

  // 新しいフィルター選択肢を取得
  const serviceTypeOptions = getAvailableServiceTypes(apiRestaurants)
  const reservationSystemOptions = getReservationSystemOptions()

  const restaurants = apiRestaurants.length > 0 ? apiRestaurants : FALLBACK_RESTAURANTS

  const filteredRestaurants = useMemo(() => {
    return restaurants.filter((restaurant) => {
      // 営業時間チェック - 営業していないレストランは常に非表示
      const businessHoursParsed = parseBusinessHours(restaurant.business_hours)
      if (!businessHoursParsed.isOpen) {
        return false
      }

      const matchesSearch =
        matchesKanaSearch(restaurant.name, searchQuery) ||
        (restaurant.description && matchesKanaSearch(restaurant.description, searchQuery))
      
      // パークフィルター（大文字小文字を統一して比較）
      const matchesPark = selectedPark === "all" || 
        restaurant.park.toLowerCase() === selectedPark.toLowerCase()
      
      const matchesArea = selectedArea === "all" || restaurant.area === selectedArea

      // サービス形態フィルター
      const matchesServiceType = selectedServiceType === "all" || 
        restaurant.service_type === selectedServiceType

      // 予約システムフィルター
      let matchesReservationSystem = true
      if (selectedReservationSystem !== "all") {
        switch (selectedReservationSystem) {
          case 'mobile_order':
            matchesReservationSystem = restaurant.mobile_order_flag === true
            break
          case 'priority_seating':
            matchesReservationSystem = restaurant.priority_seating_flag === true
            break
          default:
            matchesReservationSystem = true
        }
      }

      return matchesSearch && matchesPark && matchesArea && matchesServiceType && matchesReservationSystem
    })
  }, [restaurants, selectedPark, selectedArea, selectedServiceType, selectedReservationSystem, searchQuery])

  // ページネーション処理
  const paginationData = useMemo(() => {
    const itemsPerPage = 10
    const totalPages = Math.ceil(filteredRestaurants.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const paginatedRestaurants = filteredRestaurants.slice(startIndex, startIndex + itemsPerPage)
    
    return { itemsPerPage, totalPages, startIndex, paginatedRestaurants }
  }, [filteredRestaurants, currentPage])

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-lg">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-xl font-bold text-foreground">レストラン一覧</h1>
            </div>
            <ViewToggleButton />
          </div>

          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="キーワードを入力..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-input border-border w-full"
              />
            </div>

            <div className="space-y-3">
              {/* 第1行: パーク・エリア・営業状況 */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <Select value={selectedPark} onValueChange={handleParkChange}>
                  <SelectTrigger className="text-xs sm:text-sm">
                    <SelectValue placeholder="パーク" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全パーク</SelectItem>
                    <SelectItem value="tdl">TDL</SelectItem>
                    <SelectItem value="tds">TDS</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedArea} onValueChange={setSelectedArea}>
                  <SelectTrigger className="text-xs sm:text-sm">
                    <SelectValue placeholder="エリア" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">すべてのエリア</SelectItem>
                    {availableAreas.map((area) => (
                      <SelectItem key={area.value} value={area.value}>
                        {area.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedServiceType} onValueChange={setSelectedServiceType}>
                  <SelectTrigger className="text-xs sm:text-sm">
                    <SelectValue placeholder="サービス形態" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 第2行: 予約システム */}
              <div className="grid grid-cols-1 gap-2">
                <Select value={selectedReservationSystem} onValueChange={setSelectedReservationSystem}>
                  <SelectTrigger className="text-xs sm:text-sm">
                    <SelectValue placeholder="予約システム" />
                  </SelectTrigger>
                  <SelectContent>
                    {reservationSystemOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* フィルター条件の表示 */}
            {(selectedPark !== "all" || selectedArea !== "all" || selectedServiceType !== "all" || selectedReservationSystem !== "all" || searchQuery) && (
              <div className="flex flex-wrap gap-2">
                {selectedPark !== "all" && (
                  <Badge variant="secondary" className="text-xs">
                    パーク: {selectedPark === "tdl" ? "TDL" : "TDS"}
                  </Badge>
                )}
                {selectedArea !== "all" && (
                  <Badge variant="secondary" className="text-xs">
                    エリア: {selectedArea}
                  </Badge>
                )}
                {selectedServiceType !== "all" && (
                  <Badge variant="secondary" className="text-xs">
                    サービス形態: {selectedServiceType}
                  </Badge>
                )}
                {selectedReservationSystem !== "all" && (
                  <Badge variant="secondary" className="text-xs">
                    予約システム: {reservationSystemOptions.find(opt => opt.value === selectedReservationSystem)?.label}
                  </Badge>
                )}
                {searchQuery && (
                  <Badge variant="secondary" className="text-xs">
                    検索: {searchQuery}
                  </Badge>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("")
                    setSelectedPark("all")
                    setSelectedArea("all")
                    setOperatingStatus("all")
                    setTargetTime("17:00")
                    setCurrentPage(1)
                  }}
                  className="text-xs"
                >
                  条件をクリア
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {paginationData.paginatedRestaurants.length === 0 ? (
          <div className="text-center py-12">
            <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">条件に合うレストランは見つかりません</p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("")
                setSelectedPark("all")
                setSelectedArea("all")
                setOperatingStatus("all")
                setTargetTime("17:00")
                setCurrentPage(1)
              }}
            >
              条件をクリア
            </Button>
          </div>
        ) : (
          <>
            <div className={`grid gap-6 ${
              isMobile 
                ? 'grid-cols-2'
                : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
            }`}>
              {paginationData.paginatedRestaurants.map((restaurant) => (
                <Card key={restaurant.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-200 h-full flex flex-col">
                  <div className="aspect-[3/2] relative overflow-hidden bg-muted flex-shrink-0">
                    {restaurant.image && restaurant.image !== '/no-image-light.png' ? (
                      <img
                        src={restaurant.image}
                        alt={restaurant.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                          e.currentTarget.nextElementSibling?.classList.remove('hidden')
                        }}
                      />
                    ) : null}
                    <div className={`w-full h-full flex items-center justify-center ${restaurant.image && restaurant.image !== '/no-image-light.png' ? 'hidden' : ''}`}>
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
                  </div>

                  <CardHeader className="pb-3 flex-shrink-0">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-sm sm:text-base text-card-foreground leading-tight flex-1 min-w-0">
                        <span className="line-clamp-2 break-words">{restaurant.name}</span>
                      </CardTitle>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                      <div className="flex items-center justify-center w-4 h-4 bg-muted/50 rounded">
                        <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
                      </div>
                      <span className="truncate flex-1">{restaurant.area}</span>
                    </div>
                    <div className="mt-1">
                      <span className="text-xs font-medium text-primary">
                        {restaurant.park === 'TDL' ? 'TDL' : 'TDS'}
                      </span>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-2 flex-1 flex flex-col">
                    {restaurant.business_hours && (
                      <div className="bg-muted/50 p-2 rounded-lg flex-shrink-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="flex items-center justify-center w-4 h-4 bg-accent/20 rounded">
                            <Timer className="w-2.5 h-2.5 text-accent flex-shrink-0" />
                          </div>
                          <span className="text-xs font-medium text-card-foreground">営業時間</span>
                        </div>
                        <p className="text-xs text-card-foreground truncate">{restaurant.business_hours}</p>
                      </div>
                    )}

                    {restaurant.specialties && restaurant.specialties.length > 0 && (
                      <div className="flex-shrink-0">
                        <p className="text-xs font-medium text-card-foreground mb-1">人気メニュー</p>
                        <div className="flex flex-wrap gap-1">
                          {restaurant.specialties.slice(0, 2).map((specialty) => (
                            <Badge key={specialty} variant="outline" className="text-xs">
                              <span className="truncate max-w-[70px]">{specialty}</span>
                            </Badge>
                          ))}
                          {restaurant.specialties.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{restaurant.specialties.length - 2}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="mt-auto pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full flex items-center gap-2 bg-transparent"
                        onClick={(e) => {
                          e.stopPropagation()
                          window.open(`https://www.tokyodisneyresort.jp/${restaurant.park === 'TDL' ? 'tdl' : 'tds'}/restaurant/detail/${restaurant.id}/`, "_blank")
                        }}
                      >
                        <div className="flex items-center justify-center w-4 h-4 bg-primary/10 rounded">
                          <ExternalLink className="w-2.5 h-2.5 text-primary" />
                        </div>
                        <span className="text-xs">公式サイト</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* ページネーション */}
            {!isLoading && paginationData.totalPages > 1 && (
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
                  {Array.from({ length: Math.min(5, paginationData.totalPages) }, (_, i) => {
                    let page: number
                    if (paginationData.totalPages <= 5) {
                      page = i + 1
                    } else if (currentPage <= 3) {
                      page = i + 1
                    } else if (currentPage >= paginationData.totalPages - 2) {
                      page = paginationData.totalPages - 4 + i
                    } else {
                      page = currentPage - 2 + i
                    }

                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="min-w-[44px] h-[44px]"
                      >
                        {page}
                      </Button>
                    )
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(paginationData.totalPages, prev + 1))}
                  disabled={currentPage === paginationData.totalPages}
                  className="min-w-[44px] h-[44px]"
                >
                  <ChevronRight className="w-4 h-4" />
                  <span className="sr-only">次のページ</span>
                </Button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}