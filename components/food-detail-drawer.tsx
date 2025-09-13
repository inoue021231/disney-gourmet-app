"use client"

import { useState, useEffect } from "react"
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
  const { toggleFavorite, isFavorite } = useFavoritesContext()
  const { showToast } = useToast()

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
      setImageLoaded(false)
      setImageError(false)
    } else {
      document.body.style.overflow = "unset"
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

    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
    }
  }, [isOpen, onClose])

  const handleFavoriteToggle = () => {
    if (!item) return
    const wasLiked = isFavorite(item.id)
    toggleFavorite(item.id)
    showToast(wasLiked ? "お気に入りから削除しました" : "お気に入りに追加しました", "success")
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
        className={`fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-xl shadow-2xl transition-transform duration-250 ease-out ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ maxHeight: "90vh" }}
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
        <div className="overflow-y-auto" style={{ maxHeight: "calc(90vh - 80px)" }}>
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


              {/* レストラン情報 */}
              <div className="bg-card p-4 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center justify-center w-5 h-5 bg-primary/10 rounded">
                    <Building2 className="w-3 h-3 text-primary" />
                  </div>
                  <span className="font-medium text-card-foreground">提供店舗</span>
                </div>
                <p className="text-card-foreground">{item.restaurant}</p>
                {item.park && (
                  <p className="text-sm font-medium text-primary mt-2">
                    {item.park === 'tdl' ? '東京ディズニーランド' : '東京ディズニーシー'}
                  </p>
                )}
              </div>

              {/* 提供期間 */}
              {item.period && (
                <div className="bg-accent/10 p-4 rounded-lg border border-accent/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-accent" />
                    <span className="font-medium text-foreground">提供期間:</span>
                  </div>
                  <p className="text-foreground">{item.period}</p>
                </div>
              )}

              {/* 営業時間（サンプル） */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center justify-center w-5 h-5 bg-accent/20 rounded">
                    <Timer className="w-3 h-3 text-accent" />
                  </div>
                  <span className="font-medium text-foreground">営業時間</span>
                </div>
                <p className="text-foreground text-sm">9:00 - 21:00（ラストオーダー 20:30）</p>
                <p className="text-foreground text-sm mt-1">※営業時間は変更になる場合があります</p>
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
