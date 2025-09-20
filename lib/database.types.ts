// DATABASE_DOCUMENTATION.mdに基づくデータベース型定義

export interface RestaurantData {
  get_date: string
  restaurantID: string
  sales_start_date: string | null
  sales_end_date: string | null
  pause_start_date: string | null
  pause_end_date: string | null
}

export interface Period {
  period_start: string
  period_end: string | null
  restaurants_data: RestaurantData[]
}

export interface DisneyFood {
  food_id: string
  image_url: string | null
  title: string
  price: string | null
  periods: Period[]
}

export interface DisneyRestaurant {
  restaurant_id: number
  name: string
  park: 'tdl' | 'tds'
  area: string
  business_hours: string
  image_url: string | null
  service_type?: string
  mobile_order_flag?: boolean
  priority_seating_flag?: boolean
  reservation_flag?: boolean
}

// フロントエンド用の変換された型
export interface FoodItem {
  id: string
  title: string
  price: string
  image: string
  period?: string
  restaurant: string
  park?: string
  restaurantId?: string
  isFavorite?: boolean
  periods?: Period[]
  availableRestaurants?: string[]
  availableRestaurantNames?: string[]
  availableParks?: string[]
  availableRestaurantDetails?: {
    id: string
    name: string
    park: string
    business_hours: string
  }[]
  debugInfo?: {
    hasPeriodsData: boolean
    periodsCount: number
    availabilityStatus: string
    checkedDate?: string
    checkedTime?: string
  }
}

export interface RestaurantInfo {
  id: string
  name: string
  park: string
  area: string
  business_hours: string
  type?: string
  description?: string
  specialties?: string[]
  image: string
  service_type?: string
  mobile_order_flag?: boolean
  priority_seating_flag?: boolean
  reservation_flag?: boolean
}
