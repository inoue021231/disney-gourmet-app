"use client"

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'

export function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true)
  const { theme } = useTheme()

  useEffect(() => {
    // PWAかどうかを判定
    const isPWA = window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true ||
      document.referrer.includes('android-app://')

    if (isPWA) {
      // PWAの場合のみスプラッシュスクリーンを表示
      const timer = setTimeout(() => {
        setIsVisible(false)
      }, 2000) // 2秒間表示

      return () => clearTimeout(timer)
    } else {
      // PWAでない場合は即座に非表示
      setIsVisible(false)
    }
  }, [])

  if (!isVisible) {
    return null
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-background flex items-center justify-center">
      <div className="flex flex-col items-center space-y-6">
        {/* アプリアイコン */}
        <div className="relative">
          <img 
            src="/icon.png" 
            alt="アプリアイコン" 
            className="w-24 h-24 rounded-2xl shadow-lg"
          />
          {/* アニメーション効果 */}
          <div className="absolute inset-0 rounded-2xl bg-primary/20 animate-pulse" />
        </div>
        
        {/* アプリ名 */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-foreground">
            グルメ検索
          </h1>
          <p className="text-sm text-muted-foreground">
            テーマパークグルメアプリ
          </p>
        </div>

        {/* ローディングインジケーター */}
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  )
}
