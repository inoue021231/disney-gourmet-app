"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Search, ExternalLink, Clock } from "lucide-react"
import { useRestaurants } from "@/hooks/use-restaurants"
import { useAreas } from "@/hooks/use-areas"
import { parseBusinessHours, isCurrentlyOpen, isOpenAtTime, timeStringToMinutes } from "@/lib/api/foods"

const FALLBACK_RESTAURANTS = [
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
  },
  {
    id: "3",
    name: "サンプルレストラン C",
    park: "TDS",
    area: "サンプルエリア B",
    business_hours: "10:00 - 20:00",
    type: "レストラン",
    description: "ショーが楽しめるレストラン",
    specialties: ["ハンバーガー", "ホットドッグ", "スペシャルドリンク"],
    image: "/no-image-light.png",
  },
  {
    id: "4",
    name: "サンプルカフェ D",
    park: "TDL",
    area: "サンプルエリア A",
    business_hours: "11:30 - 21:00",
    type: "レストラン",
    description: "落ち着いた雰囲気でお食事が楽しめるレストラン",
    specialties: ["パスタ", "低アレルゲンメニュー", "コース料理"],
    image: "/no-image-light.png",
  },
]

export default function RestaurantsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPark, setSelectedPark] = useState("all")
  const [selectedArea, setSelectedArea] = useState("all")
  const [operatingStatus, setOperatingStatus] = useState("all")
  const [targetTime, setTargetTime] = useState("17:00")
  const { restaurants: apiRestaurants, isLoading } = useRestaurants()
  const { areas, getAreasByPark } = useAreas()

  // パーク変更時にエリアをリセット
  const handleParkChange = (park: string) => {
    setSelectedPark(park)
    setSelectedArea("all")
  }

  // 営業時間フィルター変更時の処理
  const handleOperatingStatusChange = (status: string) => {
    setOperatingStatus(status)
    if (status !== "open-at-time") {
      setTargetTime("17:00") // デフォルト時刻に戻す
    }
  }

  // パークに応じたエリア選択肢を取得
  const availableAreas = getAreasByPark(selectedPark)

  const restaurants = apiRestaurants.length > 0 ? apiRestaurants : FALLBACK_RESTAURANTS

  const filteredRestaurants = restaurants.filter((restaurant) => {
    // 営業時間チェック - 営業していないレストランは常に非表示
    const businessHoursParsed = parseBusinessHours(restaurant.business_hours)
    if (!businessHoursParsed.isOpen) {
      return false
    }

    // 営業時間フィルター
    if (operatingStatus === "open-now") {
      if (!isCurrentlyOpen(restaurant.business_hours)) {
        return false
      }
    } else if (operatingStatus === "open-at-time") {
      const targetMinutes = timeStringToMinutes(targetTime)
      if (!isOpenAtTime(restaurant.business_hours, targetMinutes)) {
        return false
      }
    }

    const matchesSearch =
      restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.description?.toLowerCase().includes(searchQuery.toLowerCase())
    
    // パークフィルター（大文字小文字を統一して比較）
    const matchesPark = selectedPark === "all" || 
      restaurant.park.toLowerCase() === selectedPark.toLowerCase()
    
    const matchesArea = selectedArea === "all" || restaurant.area === selectedArea

    return matchesSearch && matchesPark && matchesArea
  })

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-bold text-foreground">レストラン一覧</h1>
          </div>

          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="キーワードを入力してください"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-input border-border"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <Select value={selectedPark} onValueChange={handleParkChange}>
                <SelectTrigger>
                  <SelectValue placeholder="パーク" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全パーク</SelectItem>
                  <SelectItem value="tdl">🏰 東京ディズニーランド</SelectItem>
                  <SelectItem value="tds">🌊 東京ディズニーシー</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedArea} onValueChange={setSelectedArea}>
                <SelectTrigger>
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="space-y-2">
                <Select value={operatingStatus} onValueChange={handleOperatingStatusChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="営業状況" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">すべて</SelectItem>
                    <SelectItem value="open-now">現在営業中</SelectItem>
                    <SelectItem value="open-at-time">指定時刻に営業中</SelectItem>
                  </SelectContent>
                </Select>
                
                {operatingStatus === "open-at-time" && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <Input
                      type="time"
                      value={targetTime}
                      onChange={(e) => setTargetTime(e.target.value)}
                      className="flex-1"
                      placeholder="時刻を選択"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {filteredRestaurants.length === 0 ? (
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
              }}
            >
              条件をクリア
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredRestaurants.map((restaurant) => (
              <Card key={restaurant.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
                <div className="aspect-[3/2] relative overflow-hidden bg-muted">
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

                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg text-card-foreground">{restaurant.name}</CardTitle>
                    <Badge variant="outline" className="ml-2">
                      {restaurant.park}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{restaurant.area}</span>
                    <Badge variant="secondary" className="text-xs">
                      {restaurant.type}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{restaurant.description}</p>

                  {restaurant.business_hours && (
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-card-foreground">営業時間</span>
                      </div>
                      <p className="text-sm text-card-foreground">{restaurant.business_hours}</p>
                    </div>
                  )}

                  {restaurant.specialties && restaurant.specialties.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-card-foreground mb-2">人気メニュー</p>
                      <div className="flex flex-wrap gap-1">
                        {restaurant.specialties.map((specialty) => (
                          <Badge key={specialty} variant="outline" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full flex items-center gap-2 bg-transparent"
                    onClick={() => {
                      const parkPath = restaurant.park.toLowerCase() === 'tdl' ? 'tdl' : 'tds'
                      window.open(`https://www.tokyodisneyresort.jp/${parkPath}/restaurant/detail/${restaurant.id}/`, "_blank")
                    }}
                  >
                    <ExternalLink className="w-4 h-4" />
                    公式サイトで詳細を見る
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
