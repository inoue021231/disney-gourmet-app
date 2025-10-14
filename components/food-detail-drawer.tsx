"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { X, Heart, ExternalLink, MapPin, Calendar, Timer, Building2 } from "lucide-react"
import { useFavoritesContext } from "@/components/favorites-context"
import { useToast } from "@/components/toast-provider"
import { FoodItem } from "@/lib/database.types"

interface FoodDetailDrawerProps {
  item: FoodItem | null
  isOpen: boolean
  onClose: () => void
}

export function FoodDetailDrawer({ item, isOpen, onClose }: FoodDetailDrawerProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)
  const { toggleFavorite, isFavorite } = useFavoritesContext()
  const { showToast } = useToast()
  const drawerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const startY = useRef(0)
  const currentY = useRef(0)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
      setImageLoaded(false)
      setImageError(false)
    } else {
      document.body.style.overflow = "unset"
      // ドロワーが閉じられた時にドラッグ状態をリセット
      setIsDragging(false)
      setDragOffset(0)
    }

    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDragging) return
      
      currentY.current = e.clientY
      const deltaY = currentY.current - startY.current
      
      if (deltaY > 0) {
        setDragOffset(deltaY)
      }
    }

    const handleGlobalMouseUp = () => {
      if (!isDragging) return
      
      setIsDragging(false)
      
      const threshold = 100
      if (dragOffset > threshold) {
        onClose()
      }
      
      setDragOffset(0)
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      document.addEventListener("mousemove", handleGlobalMouseMove)
      document.addEventListener("mouseup", handleGlobalMouseUp)
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.removeEventListener("mousemove", handleGlobalMouseMove)
      document.removeEventListener("mouseup", handleGlobalMouseUp)
    }
  }, [isOpen, onClose, isDragging, dragOffset])

  const handleFavoriteToggle = () => {
    if (!item) return
    const wasLiked = isFavorite(item.id)
    toggleFavorite(item.id)
    showToast(wasLiked ? "お気に入りから削除しました" : "お気に入りに追加しました", "success")
  }

  // タッチイベントハンドラー
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!contentRef.current) return
    
    // コンテンツがスクロール位置の最上部にある場合のみドラッグを開始
    if (contentRef.current.scrollTop === 0) {
      setIsDragging(true)
      startY.current = e.touches[0].clientY
      currentY.current = e.touches[0].clientY
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !contentRef.current) return
    
    currentY.current = e.touches[0].clientY
    const deltaY = currentY.current - startY.current
    
    // 下方向のドラッグのみ許可
    if (deltaY > 0) {
      setDragOffset(deltaY)
      // ドラッグ中はスクロールを防止
      e.preventDefault()
    }
  }

  const handleTouchEnd = () => {
    if (!isDragging) return
    
    setIsDragging(false)
    
    // ドラッグ距離が閾値を超えた場合は閉じる
    const threshold = 100
    if (dragOffset > threshold) {
      onClose()
    }
    
    // リセット
    setDragOffset(0)
  }

  // マウスイベントハンドラー（デスクトップ対応）
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!contentRef.current) return
    
    if (contentRef.current.scrollTop === 0) {
      setIsDragging(true)
      startY.current = e.clientY
      currentY.current = e.clientY
    }
  }

  if (!item) return null

  return (
    <>
      {/* オーバーレイ */}
      <div
        className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-250 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* ドロワー */}
      <div
        ref={drawerRef}
        className={`fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-xl shadow-2xl ${
          isDragging ? "" : "transition-transform duration-250 ease-out"
        } ${isOpen ? "translate-y-0" : "translate-y-full"}`}
        style={{ 
          maxHeight: "90vh",
          transform: isDragging ? `translateY(${dragOffset}px)` : undefined
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
      >
        {/* ハンドル */}
        <div className="flex justify-center pt-2 pb-1">
          <div className="w-12 h-1 bg-muted rounded-full" />
        </div>

        {/* ヘッダー */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-border">
          <h2 className="text-lg font-bold text-foreground">メニュー詳細</h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="p-2">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* コンテンツ */}
        <div 
          ref={contentRef}
          className="overflow-y-auto" 
          style={{ maxHeight: "calc(90vh - 80px)" }}
        >
          <div className="p-4 space-y-6">
            {/* メイン画像 */}
            <div className="aspect-[4/3] relative overflow-hidden bg-muted rounded-lg">
              {!imageError ? (
                <img
                  src={item.image || "/no-image-light.png"}
                  alt={item.title}
                  className={`w-full h-full object-cover transition-opacity duration-300 ${
                    imageLoaded ? "opacity-100" : "opacity-0"
                  }`}
                  onLoad={() => setImageLoaded(true)}
                  onError={() => {
                    setImageError(true)
                    setImageLoaded(true)
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <img 
                    src="/no-image-light.png" 
                    alt="画像なし" 
                    className="w-full h-full object-contain opacity-60 dark:hidden" 
                  />
                  <img 
                    src="/no-image-dark.png" 
                    alt="画像なし" 
                    className="w-full h-full object-contain opacity-60 hidden dark:block" 
                  />
                </div>
              )}

              {!imageLoaded && !imageError && (
                <div className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center">
                  <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                </div>
              )}

              {/* お気に入りボタン */}
              <Button
                variant="ghost"
                size="sm"
                className={`absolute top-3 right-3 p-2 bg-background/90 backdrop-blur-sm hover:bg-background transition-all duration-200 ${
                  isFavorite(item.id) ? "text-accent" : "text-muted-foreground"
                }`}
                onClick={handleFavoriteToggle}
              >
                <Heart className={`w-5 h-5 ${isFavorite(item.id) ? "fill-current text-accent" : ""}`} />
              </Button>
            </div>

            {/* メニュー情報 */}
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold text-foreground mb-2 text-balance leading-tight">{item.title}</h3>
                <p className="text-2xl font-bold text-primary">{item.price}</p>
              </div>


              {/* 提供店舗詳細 */}
              <div className="bg-card p-4 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center justify-center w-5 h-5 bg-primary/10 rounded">
                    <Building2 className="w-3 h-3 text-primary" />
                  </div>
                  <span className="font-medium text-card-foreground">提供店舗</span>
                </div>
                
                {/* 販売中のレストラン詳細一覧 */}
                {item.availableRestaurantDetails && item.availableRestaurantDetails.length > 0 ? (
                  <div className="space-y-3">
                    {item.availableRestaurantDetails.map((restaurant, index) => (
                      <div key={index} className="bg-muted/30 p-3 rounded-lg">
                        <div className="space-y-2">
                          <div>
                            <p className="text-card-foreground font-medium">{restaurant.name}</p>
                          </div>
                          <div>
                            <p className="text-sm text-primary">
                              {(restaurant.park.toLowerCase() === 'tdl' || restaurant.park.toUpperCase() === 'TDL') ? '東京ディズニーランド' : '東京ディズニーシー'}
                            </p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-card-foreground">営業時間</span>
                            <p className="text-sm text-card-foreground">{restaurant.business_hours}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-muted/30 p-3 rounded-lg">
                    <div className="space-y-2">
                      <div>
                        <p className="text-card-foreground font-medium">{item.restaurant}</p>
                      </div>
                      {item.park && (
                        <div>
                          <p className="text-sm text-primary">
                            {(item.park.toLowerCase() === 'tdl' || item.park.toUpperCase() === 'TDL') ? '東京ディズニーランド' : '東京ディズニーシー'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>


            </div>

            {/* アクションボタン */}
            <div className="space-y-3 pb-20">
              <Button className="w-full flex items-center gap-2 h-12" onClick={() => window.open(`https://www.tokyodisneyresort.jp/food/${item.id}/`, "_blank")}>
                <div className="flex items-center justify-center w-4 h-4 bg-primary/10 rounded">
                  <ExternalLink className="w-3 h-3 text-primary" />
                </div>
                公式サイト
              </Button>

              <Button
                variant="outline"
                className="w-full flex items-center gap-2 h-12 bg-transparent"
                onClick={handleFavoriteToggle}
              >
                <Heart className={`w-4 h-4 ${isFavorite(item.id) ? "fill-current text-accent" : ""}`} />
                {isFavorite(item.id) ? "お気に入りから削除" : "お気に入りに追加"}
              </Button>

            </div>
          </div>
        </div>
      </div>
    </>
  )
}
