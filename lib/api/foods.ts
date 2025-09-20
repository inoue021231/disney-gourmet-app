import { supabase } from '@/lib/supabase'
import { DisneyFood, DisneyRestaurant, FoodItem, RestaurantInfo } from '@/lib/database.types'

/**
 * 現在販売中のメニューを取得
 */
export async function getCurrentFoods(): Promise<FoodItem[]> {
  try {
    // 現在販売中のメニューを取得
    const { data: foods, error } = await supabase
      .from('disney_foods')
      .select('*')
      .not('periods', 'is', null)

    if (error) {
      console.error('Error fetching foods:', error)
      return []
    }

    if (!foods) return []

    // レストラン情報を取得
    const { data: restaurants, error: restaurantsError } = await supabase
      .from('disney_restaurants')
      .select('*')

    if (restaurantsError) {
      console.error('Error fetching restaurants:', restaurantsError)
    }

    const restaurantMap = new Map(
      restaurants?.map(r => [r.restaurant_id.toString(), r]) || []
    )

    // 現在の日付
    const today = new Date().toISOString().split('T')[0]

    // データを変換
    const foodItems: FoodItem[] = []

    for (const food of foods as DisneyFood[]) {
      // テスト用：全メニューを取得（periodsデータの有無に関わらず）
      
      // 表示用のレストラン情報を取得
      let restaurantName = 'レストラン情報なし'
      let restaurantId = 'unknown'
      let parkInfo = 'unknown'
      let periodString: string | undefined

      // 全レストランの情報を収集
      const allParks = new Set<string>()
      
      if (food.periods && food.periods.length > 0) {
        // 全期間の全レストランからパーク情報を収集
        for (const period of food.periods) {
          for (const restaurantData of period.restaurants_data) {
            const restaurant = restaurantMap.get(restaurantData.restaurantID)
            if (restaurant) {
              allParks.add(restaurant.park)
            }
          }
        }

        // periodsデータがある場合
        const displayPeriod = food.periods[0] // 最初の期間を使用
        const latestRestaurantData = displayPeriod.restaurants_data?.[displayPeriod.restaurants_data.length - 1]
        
        if (latestRestaurantData) {
          const restaurant = restaurantMap.get(latestRestaurantData.restaurantID)
          restaurantName = restaurant?.name || 'レストラン情報なし'
          restaurantId = latestRestaurantData.restaurantID
          parkInfo = restaurant?.park || 'unknown'

          // 期間情報を生成
          if (latestRestaurantData.sales_start_date && latestRestaurantData.sales_end_date) {
            const startDate = new Date(latestRestaurantData.sales_start_date).toLocaleDateString('ja-JP')
            const endDate = new Date(latestRestaurantData.sales_end_date).toLocaleDateString('ja-JP')
            periodString = `${startDate}〜${endDate}`
          }
        }
      }

      foodItems.push({
        id: food.food_id,
        title: food.title,
        price: food.price ? `¥${parseInt(food.price).toLocaleString()}` : '価格未定',
        image: food.image_url || '/no-image-light.png',
        period: periodString,
        restaurant: restaurantName,
        park: parkInfo,
        restaurantId: restaurantId,
        isFavorite: false,
        periods: food.periods || [], // 全ての期間データを含める（なければ空配列）
        availableParks: Array.from(allParks) // 初期状態では全パークを表示
      })
    }

    return foodItems
  } catch (error) {
    console.error('Error in getCurrentFoods:', error)
    return []
  }
}

/**
 * エリア情報を取得する関数
 */
export async function getAreas(): Promise<{value: string, label: string, park: string}[]> {
  try {
    const { data: restaurants, error } = await supabase
      .from('disney_restaurants')
      .select('area, park')

    if (error) {
      console.error('Error fetching areas:', error)
      return []
    }

    if (!restaurants) return []

    // エリアを重複なしで取得し、パーク別にソート
    const areasByPark: {[key: string]: Set<string>} = {}
    
    restaurants.forEach(restaurant => {
      if (restaurant.area && restaurant.area !== '') {
        const park = restaurant.park || 'unknown'
        if (!areasByPark[park]) {
          areasByPark[park] = new Set()
        }
        areasByPark[park].add(restaurant.area)
      }
    })

    // パーク別にエリアをソート
    const areas: {value: string, label: string, park: string}[] = []
    
    // TDLエリア
    if (areasByPark.tdl) {
      Array.from(areasByPark.tdl).sort().forEach(area => {
        areas.push({ value: area, label: `🏰 ${area}`, park: 'tdl' })
      })
    }
    
    // TDSエリア
    if (areasByPark.tds) {
      Array.from(areasByPark.tds).sort().forEach(area => {
        areas.push({ value: area, label: `🌊 ${area}`, park: 'tds' })
      })
    }

    return areas
  } catch (error) {
    console.error('Error in getAreas:', error)
    return []
  }
}

/**
 * 営業時間を分析する関数
 */
export function parseBusinessHours(businessHours: string): { isOpen: boolean, openTime?: number, closeTime?: number } {
  if (!businessHours || businessHours === 'ー' || businessHours === '-' || businessHours.trim() === '') {
    return { isOpen: false }
  }

  // "10:00 - 19:30" 形式を解析
  const timePattern = /(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/
  const match = businessHours.match(timePattern)
  
  if (!match) {
    return { isOpen: false }
  }

  const [, openHour, openMin, closeHour, closeMin] = match
  const openTime = parseInt(openHour) * 60 + parseInt(openMin)
  const closeTime = parseInt(closeHour) * 60 + parseInt(closeMin)

  return {
    isOpen: true,
    openTime,
    closeTime
  }
}

/**
 * 現在時刻が営業時間内かチェックする関数
 */
export function isCurrentlyOpen(businessHours: string): boolean {
  const parsed = parseBusinessHours(businessHours)
  if (!parsed.isOpen || !parsed.openTime || !parsed.closeTime) {
    return false
  }

  const now = new Date()
  const currentTime = now.getHours() * 60 + now.getMinutes()
  
  return currentTime >= parsed.openTime && currentTime <= parsed.closeTime
}

/**
 * 指定時刻が営業時間内かチェックする関数
 */
export function isOpenAtTime(businessHours: string, targetTime: number): boolean {
  const parsed = parseBusinessHours(businessHours)
  if (!parsed.isOpen || !parsed.openTime || !parsed.closeTime) {
    return false
  }
  
  return targetTime >= parsed.openTime && targetTime <= parsed.closeTime
}

/**
 * 時刻文字列（HH:MM）を分に変換する関数
 */
export function timeStringToMinutes(timeString: string): number {
  const [hours, minutes] = timeString.split(':').map(Number)
  return hours * 60 + minutes
}

/**
 * レストラン情報を取得
 */
export async function getRestaurants(): Promise<RestaurantInfo[]> {
  try {
    const { data: restaurants, error } = await supabase
      .from('disney_restaurants')
      .select('*')

    if (error) {
      console.error('Error fetching restaurants:', error)
      return []
    }

    if (!restaurants) return []

    return restaurants.map(restaurant => ({
      id: restaurant.restaurant_id.toString(),
      name: restaurant.name,
      park: restaurant.park.toUpperCase(),
      area: restaurant.area,
      business_hours: restaurant.business_hours,
      type: 'レストラン',
      description: `${restaurant.park.toUpperCase()}の${restaurant.name}`,
      specialties: [],
      image: restaurant.image_url || '/no-image-light.png'
    }))
  } catch (error) {
    console.error('Error in getRestaurants:', error)
    return []
  }
}

/**
 * 特定のレストランのメニューを取得
 */
export async function getFoodsByRestaurant(restaurantId: string): Promise<FoodItem[]> {
  try {
    const allFoods = await getCurrentFoods()
    return allFoods.filter(food => food.restaurant.includes(restaurantId))
  } catch (error) {
    console.error('Error in getFoodsByRestaurant:', error)
    return []
  }
}

