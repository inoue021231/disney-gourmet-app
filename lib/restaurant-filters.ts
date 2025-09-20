import { FoodItem, RestaurantInfo } from "@/lib/database.types"

/**
 * サービス形態でメニューをフィルタリング
 */
export function filterByServiceType(
  menus: FoodItem[],
  restaurants: RestaurantInfo[],
  selectedServiceType: string
): FoodItem[] {
  if (selectedServiceType === 'all') {
    return menus
  }

  return menus.filter(menu => {
    // メニューが販売されているレストランを取得
    const menuRestaurants = getMenuRestaurants(menu, restaurants)
    
    // どれか一つでも指定されたサービス形態のレストランがあれば表示
    return menuRestaurants.some(restaurant => 
      restaurant.service_type === selectedServiceType
    )
  })
}

/**
 * 予約システムでメニューをフィルタリング
 */
export function filterByReservationSystem(
  menus: FoodItem[],
  restaurants: RestaurantInfo[],
  selectedReservationSystem: string
): FoodItem[] {
  if (selectedReservationSystem === 'all') {
    return menus
  }

  return menus.filter(menu => {
    // メニューが販売されているレストランを取得
    const menuRestaurants = getMenuRestaurants(menu, restaurants)
    
    // どれか一つでも指定された予約システムのレストランがあれば表示
    return menuRestaurants.some(restaurant => {
      switch (selectedReservationSystem) {
        case 'mobile_order':
          return restaurant.mobile_order_flag === true
        case 'priority_seating':
          return restaurant.priority_seating_flag === true
        default:
          return true
      }
    })
  })
}

/**
 * メニューが販売されているレストランの情報を取得
 */
function getMenuRestaurants(menu: FoodItem, restaurants: RestaurantInfo[]): RestaurantInfo[] {
  if (menu.availableRestaurants && menu.availableRestaurants.length > 0) {
    // 日付フィルター適用後の販売中レストランを使用
    return menu.availableRestaurants.map(id => 
      restaurants.find(r => r.id === id)
    ).filter(Boolean) as RestaurantInfo[]
  } else if (menu.restaurantId) {
    // フォールバック: 単一レストランID
    const restaurant = restaurants.find(r => r.id === menu.restaurantId)
    return restaurant ? [restaurant] : []
  } else {
    // フォールバック: レストラン名で検索
    return restaurants.filter(r => r.name === menu.restaurant)
  }
}

/**
 * 利用可能なサービス形態を取得
 */
export function getAvailableServiceTypes(restaurants: RestaurantInfo[]): {value: string, label: string}[] {
  const serviceTypes = new Set<string>()
  
  restaurants.forEach(restaurant => {
    if (restaurant.service_type && 
        restaurant.service_type.trim() !== '' &&
        restaurant.service_type !== 'ショーレストランタイプ') {
      serviceTypes.add(restaurant.service_type)
    }
  })

  const result = [{ value: 'all', label: '全サービス形態' }]
  Array.from(serviceTypes).sort().forEach(serviceType => {
    result.push({ value: serviceType, label: serviceType })
  })

  return result
}

/**
 * 予約システムの選択肢を取得
 */
export function getReservationSystemOptions(): {value: string, label: string}[] {
  return [
    { value: 'all', label: '全予約システム' },
    { value: 'mobile_order', label: 'モバイルオーダー' },
    { value: 'priority_seating', label: 'プライオリティシーティング' }
  ]
}
