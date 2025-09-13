"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type ViewMode = 'single' | 'double'

interface ViewModeContextType {
  viewMode: ViewMode
  toggleViewMode: () => void
}

const ViewModeContext = createContext<ViewModeContextType | undefined>(undefined)

const VIEW_MODE_STORAGE_KEY = 'app-view-mode'

export function ViewModeProvider({ children }: { children: ReactNode }) {
  const [viewMode, setViewMode] = useState<ViewMode>('double') // デフォルトを2列表示に変更

  useEffect(() => {
    // ローカルストレージから表示モードを復元（デフォルトは2列）
    const stored = localStorage.getItem(VIEW_MODE_STORAGE_KEY)
    if (stored === 'single' || stored === 'double') {
      setViewMode(stored)
    } else {
      // 初回アクセス時は2列表示をデフォルトに設定
      setViewMode('double')
      localStorage.setItem(VIEW_MODE_STORAGE_KEY, 'double')
    }
  }, [])

  const toggleViewMode = () => {
    const newMode: ViewMode = viewMode === 'single' ? 'double' : 'single'
    setViewMode(newMode)
    localStorage.setItem(VIEW_MODE_STORAGE_KEY, newMode)
  }

  return (
    <ViewModeContext.Provider value={{ viewMode, toggleViewMode }}>
      {children}
    </ViewModeContext.Provider>
  )
}

export function useViewMode() {
  const context = useContext(ViewModeContext)
  if (context === undefined) {
    throw new Error('useViewMode must be used within a ViewModeProvider')
  }
  return context
}
