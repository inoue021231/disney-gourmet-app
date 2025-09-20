import { format, parseISO, isAfter, isBefore, isEqual, isSameDay } from "date-fns"

// レストランデータの型定義
interface RestaurantData {
  get_date: string
  restaurantID: string
  pause_end_date: string | null
  sales_end_date: string | null
  pause_start_date: string | null
  sales_start_date: string | null
}

// 期間データの型定義
interface PeriodData {
  period_end: string | null
  period_start: string
  restaurants_data: RestaurantData[]
}

// 営業時間の解析
interface BusinessHours {
  isOpen: boolean
  startTime: string | null
  endTime: string | null
}

/**
 * 営業時間文字列を解析する
 */
export function parseBusinessHours(businessHoursStr: string): BusinessHours {
  if (!businessHoursStr || businessHoursStr === 'ー' || businessHoursStr === '-') {
    return {
      isOpen: false,
      startTime: null,
      endTime: null
    }
  }

  const match = businessHoursStr.match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/)
  if (match) {
    const [, startHour, startMinute, endHour, endMinute] = match
    return {
      isOpen: true,
      startTime: `${startHour.padStart(2, '0')}:${startMinute}`,
      endTime: `${endHour.padStart(2, '0')}:${endMinute}`
    }
  }

  return {
    isOpen: false,
    startTime: null,
    endTime: null
  }
}

/**
 * 時刻文字列を分に変換する
 */
export function timeStringToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number)
  return hours * 60 + minutes
}

/**
 * 指定された日付時刻にレストランが営業しているかチェック
 */
export function isRestaurantOpenAt(businessHours: string, targetDate: Date, targetTime?: string): boolean {
  const parsed = parseBusinessHours(businessHours)
  
  if (!parsed.isOpen) {
    return false
  }

  // 時刻が指定されていない場合は営業日であればOK
  if (!targetTime) {
    return true
  }

  const targetMinutes = timeStringToMinutes(targetTime)
  const startMinutes = timeStringToMinutes(parsed.startTime!)
  const endMinutes = timeStringToMinutes(parsed.endTime!)

  return targetMinutes >= startMinutes && targetMinutes <= endMinutes
}

/**
 * レストランデータから最新のget_dateのものを優先して取得
 */
function getLatestRestaurantData(restaurantData: RestaurantData[]): RestaurantData[] {
  const groupedByRestaurant = restaurantData.reduce((acc, data) => {
    if (!acc[data.restaurantID]) {
      acc[data.restaurantID] = []
    }
    acc[data.restaurantID].push(data)
    return acc
  }, {} as Record<string, RestaurantData[]>)

  // 各レストランIDごとに最新のget_dateを含むすべてのデータを返す
  return Object.values(groupedByRestaurant).flat().sort((a, b) => {
    // get_dateで降順ソート（最新が先頭）
    return b.get_date.localeCompare(a.get_date)
  })
}


/**
 * 指定された日付にメニューが販売されているかチェック（簡素化版）
 */
export function isMenuAvailable(
  periods: PeriodData[],
  restaurantBusinessHours: Record<string, string>,
  targetDate: Date,
  targetTime?: string
): { isAvailable: boolean; availableRestaurants: string[] } {
  const targetDateStr = format(targetDate, 'yyyy-MM-dd')
  const availableRestaurants: string[] = []

  for (const period of periods) {
    // 基本的な掲載期間をチェック（文字列比較で時差問題を回避）
    const periodStartStr = period.period_start
    const periodEndStr = period.period_end

    // 対象日が掲載期間内にあるかチェック（文字列比較）
    const isInPeriod = (targetDateStr >= periodStartStr) &&
                      (!periodEndStr || targetDateStr <= periodEndStr)

    if (!isInPeriod) {
      continue // 掲載期間外の場合はスキップ
    }

    // レストランデータをチェック
    for (const restaurantData of period.restaurants_data) {
      const restaurantID = restaurantData.restaurantID
      let isRestaurantAvailable = true

      // 販売期間のチェック（sales_*が設定されている場合のみ）
      if (restaurantData.sales_start_date && restaurantData.sales_start_date !== 'null') {
        const salesStartStr = restaurantData.sales_start_date
        
        // 文字列比較で開始日をチェック（開始日を含む）
        if (targetDateStr < salesStartStr) {
          isRestaurantAvailable = false
        }
      }

      if (restaurantData.sales_end_date && restaurantData.sales_end_date !== 'null' && isRestaurantAvailable) {
        const salesEndStr = restaurantData.sales_end_date
        
        // 文字列比較で終了日をチェック（終了日を含む）
        if (targetDateStr > salesEndStr) {
          isRestaurantAvailable = false
        }
      }

      // 休止期間のチェック
      if (isRestaurantAvailable && (restaurantData.pause_start_date || restaurantData.pause_end_date)) {
        let inPausePeriod = false
        
        if (restaurantData.pause_start_date && restaurantData.pause_start_date !== 'null' &&
            restaurantData.pause_end_date && restaurantData.pause_end_date !== 'null') {
          // 両方が設定されている場合：その期間は休止（文字列比較）
          const pauseStartStr = restaurantData.pause_start_date
          const pauseEndStr = restaurantData.pause_end_date
          if (targetDateStr >= pauseStartStr && targetDateStr <= pauseEndStr) {
            inPausePeriod = true
          }
        } else if (restaurantData.pause_start_date && restaurantData.pause_start_date !== 'null') {
          // 開始日のみ：その日以降は休止（文字列比較）
          const pauseStartStr = restaurantData.pause_start_date
          if (targetDateStr >= pauseStartStr) {
            inPausePeriod = true
          }
        } else if (restaurantData.pause_end_date && restaurantData.pause_end_date !== 'null') {
          // 終了日のみ：その日以前は休止（文字列比較）
          const pauseEndStr = restaurantData.pause_end_date
          if (targetDateStr <= pauseEndStr) {
            inPausePeriod = true
          }
        }
        
        if (inPausePeriod) {
          isRestaurantAvailable = false
        }
      }

      // このレストランで販売中の場合、リストに追加
      if (isRestaurantAvailable && !availableRestaurants.includes(restaurantID)) {
        availableRestaurants.push(restaurantID)
      }
    }
  }
  return {
    isAvailable: availableRestaurants.length > 0,
    availableRestaurants
  }
}

/**
 * メニューリストを指定された日付時刻でフィルタリング
 */
export function filterMenusByAvailability(
  menus: any[],
  restaurants: any[],
  targetDate: Date,
  targetTime?: string
): any[] {
  // レストランの営業時間マップを作成
  const restaurantBusinessHours = restaurants.reduce((acc, restaurant) => {
    acc[restaurant.id] = restaurant.business_hours
    return acc
  }, {} as Record<string, string>)

  const targetDateStr = format(targetDate, 'yyyy-MM-dd')

  return menus.filter(menu => {
    // デバッグ情報を追加
    const hasPeriodsData = !!(menu.periods && Array.isArray(menu.periods))
    const periodsCount = hasPeriodsData ? menu.periods.length : 0
    
    if (!hasPeriodsData) {
      menu.debugInfo = {
        hasPeriodsData: false,
        periodsCount: 0,
        availabilityStatus: 'No periods data',
        checkedDate: targetDateStr,
        checkedTime: targetTime
      }
      return false
    }

    const { isAvailable, availableRestaurants } = isMenuAvailable(
      menu.periods,
      restaurantBusinessHours,
      targetDate,
      targetTime
    )

    // デバッグ情報を追加
    menu.debugInfo = {
      hasPeriodsData: true,
      periodsCount,
      availabilityStatus: isAvailable ? `Available at ${availableRestaurants.length} restaurants` : 'Not available',
      checkedDate: targetDateStr,
      checkedTime: targetTime
    }

    // 販売中のレストラン情報をメニューに追加
    if (isAvailable) {
      menu.availableRestaurants = availableRestaurants
      menu.availableRestaurantNames = availableRestaurants.map(id => {
        const restaurant = restaurants.find(r => r.id === id)
        return restaurant ? restaurant.name : id
      })
      
      // 販売中レストランの詳細情報を取得
      menu.availableRestaurantDetails = availableRestaurants.map(id => {
        const restaurant = restaurants.find(r => r.id === id)
        return restaurant ? {
          id: restaurant.id,
          name: restaurant.name,
          park: restaurant.park,
          business_hours: restaurant.business_hours
        } : null
      }).filter(Boolean)
      
      // 販売中レストランのパーク情報を取得
      const availableParks = [...new Set(availableRestaurants.map(id => {
        const restaurant = restaurants.find(r => r.id === id)
        return restaurant ? restaurant.park : null
      }).filter(Boolean))]
      
      menu.availableParks = availableParks
    }

    return isAvailable
  })
}
