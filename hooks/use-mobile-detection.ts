"use client"

import { useState, useEffect } from 'react'

export function useMobileDetection() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkIsMobile = () => {
      // 画面幅が768px未満（Tailwindのsmブレークポイント）をモバイルとする
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
    }

    // 初回チェック
    checkIsMobile()

    // リサイズ時のチェック
    window.addEventListener('resize', checkIsMobile)

    return () => {
      window.removeEventListener('resize', checkIsMobile)
    }
  }, [])

  return isMobile
}
