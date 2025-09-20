import { FoodItem, Period } from "@/lib/database.types"
import { format } from "date-fns"

/**
 * メニューの販売期間情報をコンソールに詳細表示
 */
export function logMenuDebugInfo(menu: FoodItem, currentDate?: Date) {
  const currentDateStr = currentDate ? format(currentDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')
  
  console.group(`🍽️ メニュー詳細: ${menu.title} (ID: ${menu.id})`)
  
  // 基本情報
  console.log(`📍 レストラン: ${menu.restaurant}`)
  console.log(`💰 価格: ${menu.price}`)
  console.log(`🏰 パーク: ${menu.park || 'N/A'}`)
  console.log(`📅 現在の日付: ${currentDateStr}`)
  
  // 期間データの有無
  if (!menu.periods || menu.periods.length === 0) {
    console.warn('⚠️ 期間データ (periods) が存在しません')
    console.groupEnd()
    return
  }
  
  console.log(`📊 期間データ数: ${menu.periods.length}`)
  
  // 各期間の詳細
  menu.periods.forEach((period: Period, index: number) => {
    console.group(`📈 期間 ${index + 1}`)
    console.log(`開始日: ${period.period_start}`)
    console.log(`終了日: ${period.period_end || '未設定（継続中）'}`)
    
    // 現在日付が期間内かチェック
    const startDate = new Date(period.period_start)
    const endDate = period.period_end ? new Date(period.period_end) : null
    const checkDate = currentDate || new Date()
    
    const isInPeriod = checkDate >= startDate && (!endDate || checkDate <= endDate)
    console.log(`🎯 現在日付が期間内: ${isInPeriod ? '✅ はい' : '❌ いいえ'}`)
    
    if (!isInPeriod) {
      if (checkDate < startDate) {
        console.log(`   理由: 開始日 ${period.period_start} より前`)
      } else if (endDate && checkDate > endDate) {
        console.log(`   理由: 終了日 ${period.period_end} より後`)
      }
    }
    
    // レストランデータ
    console.log(`🏪 対象レストラン数: ${period.restaurants_data.length}`)
    
    period.restaurants_data.forEach((restaurant, restIndex) => {
      console.group(`🏪 レストラン ${restIndex + 1} (ID: ${restaurant.restaurantID})`)
      console.log(`取得日: ${restaurant.get_date}`)
      
      // 販売期間
      if (restaurant.sales_start_date || restaurant.sales_end_date) {
        console.log(`🛍️ 販売期間:`)
        console.log(`  開始: ${restaurant.sales_start_date || '未設定'}`)
        console.log(`  終了: ${restaurant.sales_end_date || '未設定'}`)
        
        // 販売期間内かチェック
        if (restaurant.sales_start_date || restaurant.sales_end_date) {
          let inSalesPeriod = true
          let salesReason = ''
          
          if (restaurant.sales_start_date) {
            const salesStart = new Date(restaurant.sales_start_date)
            if (checkDate < salesStart) {
              inSalesPeriod = false
              salesReason = `販売開始日 ${restaurant.sales_start_date} より前`
            }
          }
          
          if (restaurant.sales_end_date && inSalesPeriod) {
            const salesEnd = new Date(restaurant.sales_end_date)
            if (checkDate > salesEnd) {
              inSalesPeriod = false
              salesReason = `販売終了日 ${restaurant.sales_end_date} より後`
            }
          }
          
          console.log(`  📊 販売期間内: ${inSalesPeriod ? '✅ はい' : '❌ いいえ'}`)
          if (!inSalesPeriod) {
            console.log(`  理由: ${salesReason}`)
          }
        }
      } else {
        console.log(`🛍️ 販売期間: 制限なし`)
      }
      
      // 休止期間
      if (restaurant.pause_start_date || restaurant.pause_end_date) {
        console.log(`⏸️ 休止期間:`)
        console.log(`  開始: ${restaurant.pause_start_date || '未設定'}`)
        console.log(`  終了: ${restaurant.pause_end_date || '未設定'}`)
        
        // 休止期間内かチェック
        let inPausePeriod = false
        let pauseReason = ''
        
        if (restaurant.pause_start_date && restaurant.pause_end_date) {
          const pauseStart = new Date(restaurant.pause_start_date)
          const pauseEnd = new Date(restaurant.pause_end_date)
          if (checkDate >= pauseStart && checkDate <= pauseEnd) {
            inPausePeriod = true
            pauseReason = `休止期間 ${restaurant.pause_start_date} - ${restaurant.pause_end_date} 内`
          }
        } else if (restaurant.pause_start_date) {
          const pauseStart = new Date(restaurant.pause_start_date)
          if (checkDate >= pauseStart) {
            inPausePeriod = true
            pauseReason = `休止開始日 ${restaurant.pause_start_date} 以降`
          }
        } else if (restaurant.pause_end_date) {
          const pauseEnd = new Date(restaurant.pause_end_date)
          if (checkDate <= pauseEnd) {
            inPausePeriod = true
            pauseReason = `休止終了日 ${restaurant.pause_end_date} 以前`
          }
        }
        
        console.log(`  📊 休止期間内: ${inPausePeriod ? '❌ はい' : '✅ いいえ'}`)
        if (inPausePeriod) {
          console.log(`  理由: ${pauseReason}`)
        }
      } else {
        console.log(`⏸️ 休止期間: なし`)
      }
      
      console.groupEnd()
    })
    
    console.groupEnd()
  })
  
  // 最終判定結果
  if (menu.debugInfo) {
    console.log(`🎯 最終判定: ${menu.debugInfo.availabilityStatus}`)
    if (menu.availableRestaurantNames && menu.availableRestaurantNames.length > 0) {
      console.log(`🏪 販売中レストラン: ${menu.availableRestaurantNames.join(', ')}`)
    }
  }
  
  console.groupEnd()
}

/**
 * 日付フィルタリング結果をコンソールに表示
 */
export function logFilteringResults(
  originalCount: number, 
  filteredCount: number, 
  selectedDate: Date | null
) {
  const dateStr = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '未選択'
  
  console.group(`🔍 フィルタリング結果`)
  console.log(`📅 選択日付: ${dateStr}`)
  console.log(`📊 元のメニュー数: ${originalCount}`)
  console.log(`📊 フィルター後: ${filteredCount}`)
  console.log(`📊 除外されたメニュー: ${originalCount - filteredCount}`)
  
  if (filteredCount === 0 && selectedDate) {
    console.warn('⚠️ 選択した日付で販売中のメニューがありません')
    console.log('💡 確認ポイント:')
    console.log('  - メニューに periods データが存在するか')
    console.log('  - 選択日付が販売期間内にあるか')
    console.log('  - 休止期間に該当していないか')
  }
  
  console.groupEnd()
}

/**
 * 全メニューのperiodsデータを抽出してコンソールに表示
 */
export function extractAllPeriodsData(menus: FoodItem[]) {
  console.group('📊 全メニューのperiodsデータ抽出')
  console.log(`総メニュー数: ${menus.length}`)
  
  const menusWithPeriods: any[] = []
  const menusWithoutPeriods: any[] = []
  
  menus.forEach((menu, index) => {
    const menuData = {
      index: index + 1,
      id: menu.id,
      title: menu.title,
      restaurant: menu.restaurant,
      park: menu.park,
      hasPeriodsData: !!(menu.periods && menu.periods.length > 0),
      periodsData: menu.periods || null
    }
    
    if (menuData.hasPeriodsData) {
      menusWithPeriods.push(menuData)
    } else {
      menusWithoutPeriods.push(menuData)
    }
  })
  
  console.log(`periodsデータありのメニュー: ${menusWithPeriods.length}`)
  console.log(`periodsデータなしのメニュー: ${menusWithoutPeriods.length}`)
  
  // periodsデータありのメニューを詳細表示
  if (menusWithPeriods.length > 0) {
    console.group('🟢 periodsデータありのメニュー')
    menusWithPeriods.forEach((menu) => {
      console.group(`${menu.index}. ${menu.title} (ID: ${menu.id})`)
      console.log(`レストラン: ${menu.restaurant}`)
      console.log(`パーク: ${menu.park}`)
      console.log(`periods数: ${menu.periodsData.length}`)
      
      menu.periodsData.forEach((period: any, pIndex: number) => {
        console.group(`期間 ${pIndex + 1}`)
        console.log(`period_start: ${period.period_start}`)
        console.log(`period_end: ${period.period_end}`)
        console.log(`restaurants_data数: ${period.restaurants_data ? period.restaurants_data.length : 0}`)
        
        if (period.restaurants_data && period.restaurants_data.length > 0) {
          period.restaurants_data.forEach((restaurant: any, rIndex: number) => {
            console.group(`レストラン ${rIndex + 1}`)
            console.log(`restaurantID: ${restaurant.restaurantID}`)
            console.log(`get_date: ${restaurant.get_date}`)
            console.log(`sales_start_date: ${restaurant.sales_start_date}`)
            console.log(`sales_end_date: ${restaurant.sales_end_date}`)
            console.log(`pause_start_date: ${restaurant.pause_start_date}`)
            console.log(`pause_end_date: ${restaurant.pause_end_date}`)
            console.groupEnd()
          })
        }
        console.groupEnd()
      })
      console.groupEnd()
    })
    console.groupEnd()
  }
  
  // periodsデータなしのメニューをリスト表示
  if (menusWithoutPeriods.length > 0) {
    console.group('🔴 periodsデータなしのメニュー')
    menusWithoutPeriods.forEach((menu) => {
      console.log(`${menu.index}. ${menu.title} (ID: ${menu.id}) - ${menu.restaurant} [${menu.park}]`)
    })
    console.groupEnd()
  }
  
  // 統計情報
  console.group('📈 統計情報')
  console.log(`全メニュー数: ${menus.length}`)
  console.log(`periodsデータあり: ${menusWithPeriods.length} (${((menusWithPeriods.length / menus.length) * 100).toFixed(1)}%)`)
  console.log(`periodsデータなし: ${menusWithoutPeriods.length} (${((menusWithoutPeriods.length / menus.length) * 100).toFixed(1)}%)`)
  console.groupEnd()
  
  // JSON形式で全データを出力（コピペ用）
  console.group('📋 JSON形式データ（コピペ用）')
  const allPeriodsData = {
    summary: {
      totalMenus: menus.length,
      menusWithPeriods: menusWithPeriods.length,
      menusWithoutPeriods: menusWithoutPeriods.length
    },
    menusWithPeriods: menusWithPeriods.map(menu => ({
      id: menu.id,
      title: menu.title,
      restaurant: menu.restaurant,
      park: menu.park,
      periods: menu.periodsData
    })),
    menusWithoutPeriods: menusWithoutPeriods.map(menu => ({
      id: menu.id,
      title: menu.title,
      restaurant: menu.restaurant,
      park: menu.park
    }))
  }
  
  console.log('=== JSON DATA START ===')
  console.log(JSON.stringify(allPeriodsData, null, 2))
  console.log('=== JSON DATA END ===')
  console.groupEnd()
  
  console.groupEnd()
  
  return allPeriodsData
}
