"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { ChevronDown, ChevronUp, X, Filter } from "lucide-react"
import { useAreas } from "@/hooks/use-areas"
import { getAvailableServiceTypes, getReservationSystemOptions } from "@/lib/restaurant-filters"
import { useRestaurants } from "@/hooks/use-restaurants"

interface FilterState {
  park: string
  area: string
  priceRange: [number, number]
  sortBy: string
  serviceType: string
  reservationSystem: string
}

interface FilterBarProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  isExpanded: boolean
  onToggleExpanded: () => void
  resultCount?: number
}

const PARKS = [
  { value: "all", label: "全パーク" },
  { value: "tdl", label: "東京ディズニーランド" },
  { value: "tds", label: "東京ディズニーシー" },
]

const AREAS = [
  { value: "all", label: "全エリア" },
  { value: "world-bazaar", label: "ワールドバザール" },
  { value: "adventureland", label: "アドベンチャーランド" },
  { value: "westernland", label: "ウエスタンランド" },
  { value: "fantasyland", label: "ファンタジーランド" },
  { value: "american-waterfront", label: "アメリカンウォーターフロント" },
]


const SORT_OPTIONS = [
  { value: "recommended", label: "おすすめ" },
  { value: "price-asc", label: "価格昇順" },
  { value: "price-desc", label: "価格降順" },
  { value: "newest", label: "新着" },
]


export function FilterBar({ filters, onFiltersChange, isExpanded, onToggleExpanded, resultCount }: FilterBarProps) {
  const { areas, getAreasByPark } = useAreas()
  const { restaurants } = useRestaurants()
  
  const serviceTypeOptions = getAvailableServiceTypes(restaurants)
  const reservationSystemOptions = getReservationSystemOptions()
  
  const hasActiveFilters =
    filters.park !== "all" ||
    filters.area !== "all" ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < 3000 ||
    filters.serviceType !== "all" ||
    filters.reservationSystem !== "all"

  // パークに応じてエリアフィルターをリセット
  const handleParkChange = (park: string) => {
    onFiltersChange({ 
      ...filters, 
      park, 
      area: "all" // パーク変更時はエリアをリセット
    })
  }

  // パークに応じたエリア選択肢を取得
  const availableAreas = getAreasByPark(filters.park)

  const clearFilters = () => {
    onFiltersChange({
      park: "all",
      area: "all",
      priceRange: [0, 3000],
      sortBy: "recommended",
      serviceType: "all",
      reservationSystem: "all"
    })
  }

  return (
    <div className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={onToggleExpanded} className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              フィルター
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-1">
                  適用中
                </Badge>
              )}
            </Button>
            {typeof resultCount === "number" && (
              <span className="text-sm text-muted-foreground">{resultCount}件</span>
            )}
          </div>

          <Select value={filters.sortBy} onValueChange={(value) => onFiltersChange({ ...filters, sortBy: value })}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isExpanded && (
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select value={filters.park} onValueChange={handleParkChange}>
                <SelectTrigger>
                  <SelectValue placeholder="パークを選択" />
                </SelectTrigger>
                <SelectContent>
                  {PARKS.map((park) => (
                    <SelectItem key={park.value} value={park.value}>
                      {park.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filters.area} onValueChange={(value) => onFiltersChange({ ...filters, area: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="エリアを選択" />
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

              <Select value={filters.serviceType} onValueChange={(value) => onFiltersChange({ ...filters, serviceType: value })}>
                <SelectTrigger>
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

            <div className="grid grid-cols-1 gap-4">
              <Select value={filters.reservationSystem} onValueChange={(value) => onFiltersChange({ ...filters, reservationSystem: value })}>
                <SelectTrigger>
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

            <div>
              <label className="text-sm font-medium text-card-foreground mb-2 block">
                価格帯: ¥{filters.priceRange[0]} - ¥{filters.priceRange[1]}
              </label>
              <div className="px-2">
                <Slider
                  value={filters.priceRange}
                  onValueChange={(value) => onFiltersChange({ ...filters, priceRange: value as [number, number] })}
                  max={3000}
                  min={0}
                  step={100}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>¥0</span>
                  <span>¥3,000</span>
                </div>
              </div>
            </div>

            {hasActiveFilters && (
              <Button variant="outline" onClick={clearFilters} className="flex items-center gap-2 bg-transparent">
                <X className="w-4 h-4" />
                条件をクリア
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
