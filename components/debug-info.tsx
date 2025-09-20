"use client"

import { FoodItem } from "@/lib/database.types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { ChevronDown, ChevronUp, Bug } from "lucide-react"

interface DebugInfoProps {
  item: FoodItem
}

export function DebugInfo({ item }: DebugInfoProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!item.debugInfo) {
    return null
  }

  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mt-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bug className="w-4 h-4 text-yellow-600" />
          <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
            デバッグ情報
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-6 px-2 text-yellow-600 hover:text-yellow-700"
        >
          {isExpanded ? (
            <ChevronUp className="w-3 h-3" />
          ) : (
            <ChevronDown className="w-3 h-3" />
          )}
        </Button>
      </div>

      {isExpanded && (
        <div className="mt-3 space-y-2 text-sm">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="font-medium text-yellow-800 dark:text-yellow-200">
                Periodsデータ:
              </span>
              <Badge variant={item.debugInfo.hasPeriodsData ? "default" : "destructive"} className="ml-2">
                {item.debugInfo.hasPeriodsData ? "あり" : "なし"}
              </Badge>
            </div>
            <div>
              <span className="font-medium text-yellow-800 dark:text-yellow-200">
                期間数:
              </span>
              <Badge variant="outline" className="ml-2">
                {item.debugInfo.periodsCount}
              </Badge>
            </div>
          </div>

          <div>
            <span className="font-medium text-yellow-800 dark:text-yellow-200">
              販売状況:
            </span>
            <Badge 
              variant={item.debugInfo.availabilityStatus.includes('Available') ? "default" : "secondary"}
              className="ml-2"
            >
              {item.debugInfo.availabilityStatus}
            </Badge>
          </div>

          {item.debugInfo.checkedDate && (
            <div>
              <span className="font-medium text-yellow-800 dark:text-yellow-200">
                チェック日時:
              </span>
              <span className="ml-2 text-yellow-700 dark:text-yellow-300">
                {item.debugInfo.checkedDate}
                {item.debugInfo.checkedTime && ` ${item.debugInfo.checkedTime}`}
              </span>
            </div>
          )}

          {item.periods && item.periods.length > 0 && (
            <div className="mt-3 pt-2 border-t border-yellow-200 dark:border-yellow-800">
              <span className="font-medium text-yellow-800 dark:text-yellow-200">
                期間詳細:
              </span>
              <div className="mt-1 space-y-1">
                {item.periods.map((period, index) => (
                  <div key={index} className="text-xs text-yellow-700 dark:text-yellow-300">
                    {period.period_start} 〜 {period.period_end || "現在"}
                    <span className="ml-2">
                      (レストラン: {period.restaurants_data.length}件)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {item.availableRestaurantNames && item.availableRestaurantNames.length > 0 && (
            <div className="mt-2">
              <span className="font-medium text-yellow-800 dark:text-yellow-200">
                販売中レストラン:
              </span>
              <div className="flex flex-wrap gap-1 mt-1">
                {item.availableRestaurantNames.map((name, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
