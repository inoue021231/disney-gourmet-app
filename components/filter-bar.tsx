"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { ChevronDown, ChevronUp, X, Filter, Timer } from "lucide-react"
import { useAreas } from "@/hooks/use-areas"

interface FilterState {
  park: string
  area: string
  priceRange: [number, number]
  sortBy: string
  operatingStatus: string // 'all' | 'open-now' | 'open-at-time'
  targetTime?: string // 'HH:MM' format
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

const OPERATING_STATUS_OPTIONS = [
  { value: "all", label: "すべて" },
  { value: "open-now", label: "現在営業中" },
  { value: "open-at-time", label: "指定時刻に営業中" },
]

export function FilterBar({ filters, onFiltersChange, isExpanded, onToggleExpanded, resultCount }: FilterBarProps) {
  const { areas, getAreasByPark } = useAreas()
  
  const hasActiveFilters =
    filters.park !== "all" ||
    filters.area !== "all" ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < 3000 ||
    filters.operatingStatus !== "all"

  // パークに応じてエリアフィルターをリセット
  const handleParkChange = (park: string) => {
    onFiltersChange({ 
      ...filters, 
      park, 
      area: "all" // パーク変更時はエリアをリセット
    })
  }

  // 営業時間フィルター変更時の処理
  const handleOperatingStatusChange = (status: string) => {
    const newFilters = { ...filters, operatingStatus: status }
    if (status !== "open-at-time") {
      delete newFilters.targetTime // 指定時刻以外の場合は時刻をクリア
    }
    onFiltersChange(newFilters)
  }

  // パークに応じたエリア選択肢を取得
  const availableAreas = getAreasByPark(filters.park)

  const clearFilters = () => {
    onFiltersChange({
      park: "all",
      area: "all",
      priceRange: [0, 3000],
      sortBy: "recommended",
      operatingStatus: "all",
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

              <div className="space-y-2">
                <Select value={filters.operatingStatus} onValueChange={handleOperatingStatusChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="営業状況" />
                  </SelectTrigger>
                  <SelectContent>
                    {OPERATING_STATUS_OPTIONS.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {filters.operatingStatus === "open-at-time" && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-4 h-4 bg-accent/20 rounded">
                      <Timer className="w-2.5 h-2.5 text-accent" />
                    </div>
                    <Input
                      type="time"
                      value={filters.targetTime || "17:00"}
                      onChange={(e) => onFiltersChange({ ...filters, targetTime: e.target.value })}
                      className="flex-1"
                      placeholder="時刻を選択"
                    />
                  </div>
                )}
              </div>
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
