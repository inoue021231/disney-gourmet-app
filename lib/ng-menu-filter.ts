/**
 * NGメニュー名のリスト
 * 完全一致するメニューは表示から除外される
 */
export const NG_MENU_NAMES = [
  'パン',
  'ライス'
]

/**
 * メニューがNGリストに含まれているかチェック
 */
export function isNGMenu(menuTitle: string): boolean {
  return NG_MENU_NAMES.includes(menuTitle.trim())
}

/**
 * メニューリストからNGメニューを除外
 */
export function filterOutNGMenus<T extends { title: string }>(menus: T[]): T[] {
  return menus.filter(menu => !isNGMenu(menu.title))
}
