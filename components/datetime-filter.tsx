"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X } from "lucide-react"
import { format } from "date-fns"

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
        <Label className="font-medium">販売日フィルター</Label>
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

      <div>
        <Input
          id="date-input"
          type="date"
          min={today}
          value={selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''}
          onChange={(e) => handleDateChange(e.target.value)}
          className="w-full"
        />
      </div>
    </div>
  )
}
