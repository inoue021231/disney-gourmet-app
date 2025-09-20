"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar, X } from "lucide-react"
import { format } from "date-fns"
import { ja } from "date-fns/locale"

interface DateFilterProps {
  onDateChange: (date: Date | null) => void
}

export function DateFilter({ onDateChange }: DateFilterProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  // 今日の日付を取得（YYYY-MM-DD形式）
  const today = format(new Date(), 'yyyy-MM-dd')

  // 日付変更時の処理
  const handleDateChange = (dateString: string) => {
    if (dateString) {
      const date = new Date(dateString)
      setSelectedDate(date)
      onDateChange(date)
    } else {
      setSelectedDate(null)
      onDateChange(null)
    }
  }

  // リセット処理
  const handleReset = () => {
    setSelectedDate(null)
    onDateChange(null)
  }

  // 初期化時に現在の日付を設定
  useEffect(() => {
    const now = new Date()
    setSelectedDate(now)
    onDateChange(now)
  }, [])

  return (
    <div className="bg-muted/50 p-4 rounded-lg space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          <Label className="font-medium">販売日フィルター</Label>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
          className="h-8 px-2"
        >
          <X className="w-3 h-3" />
          リセット
        </Button>
      </div>

      <div className="space-y-2">
        <Label htmlFor="date-input" className="text-sm font-medium">
          日付
        </Label>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="date-input"
            type="date"
            min={today}
            value={selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''}
            onChange={(e) => handleDateChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          未選択の場合は現在の日付を参照
        </p>
      </div>

      {/* 現在の選択状態を表示 */}
      <div className="pt-2 border-t border-border">
        <div className="text-sm text-muted-foreground">
          <span className="font-medium">選択中:</span>{' '}
          {selectedDate ? (
            format(selectedDate, 'yyyy年M月d日(E)', { locale: ja })
          ) : (
            '現在の日付'
          )}
        </div>
      </div>
    </div>
  )
}
