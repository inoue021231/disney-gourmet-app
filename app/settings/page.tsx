"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Settings, Palette, Database, Info, ExternalLink, Heart, Trash2, LogOut } from "lucide-react"
import { useFavoritesContext } from "@/components/favorites-context"
import { useToast } from "@/components/toast-provider"
import { useTheme } from "next-themes"

export default function SettingsPage() {
  const [notifications, setNotifications] = useState(true)
  const [autoSync, setAutoSync] = useState(true)
  const [mounted, setMounted] = useState(false)
  const { favoriteCount, clearAllFavorites } = useFavoritesContext()
  const { showToast } = useToast()
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleClearAll = () => {
    if (confirm("すべてのお気に入りを削除しますか？この操作は取り消せません。")) {
      clearAllFavorites()
      showToast("すべてのお気に入りを削除しました", "success")
    }
  }

  const handleThemeToggle = (checked: boolean) => {
    setTheme(checked ? "dark" : "light")
  }

  const handleLogout = async () => {
    if (confirm("ログアウトしますか？")) {
      try {
        const response = await fetch('/api/logout', {
          method: 'POST',
        })
        
        if (response.ok) {
          showToast("ログアウトしました", "success")
          // ページをリロードして認証画面に戻る
          window.location.reload()
        } else {
          showToast("ログアウトに失敗しました", "error")
        }
      } catch (error) {
        showToast("ログアウトに失敗しました", "error")
      }
    }
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              <h1 className="text-xl font-bold text-foreground">設定</h1>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-6">
          <div className="animate-pulse">読み込み中...</div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-bold text-foreground">設定</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* お気に入り管理 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5" />
              お気に入り管理
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">お気に入り登録数</p>
                <p className="text-sm text-muted-foreground">
                  {favoriteCount}件がお気に入りに登録されています
                </p>
              </div>
              <Badge variant="secondary">{favoriteCount}件</Badge>
            </div>

            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={handleClearAll}
                disabled={favoriteCount === 0}
                className="flex items-center gap-2 bg-transparent text-destructive hover:text-destructive disabled:text-muted-foreground"
              >
                <Trash2 className="w-4 h-4" />
                全削除
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              お気に入りデータはブラウザに保存されます。
            </p>
          </CardContent>
        </Card>

        {/* テーマ設定 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              表示設定
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">テーマ</p>
                <p className="text-sm text-muted-foreground">アプリの表示テーマを選択します</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={theme === "light" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTheme("light")}
                  className="min-w-[70px]"
                >
                  ライト
                </Button>
                <Button
                  variant={theme === "dark" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTheme("dark")}
                  className="min-w-[70px]"
                >
                  ダーク
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* データ設定 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              データ管理
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">自動同期</p>
                <p className="text-sm text-muted-foreground">お気に入りデータを自動で同期します</p>
              </div>
              <Switch
                checked={autoSync}
                onCheckedChange={setAutoSync}
                className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-muted-foreground/30 border-2 data-[state=unchecked]:border-muted-foreground/40"
              />
            </div>

            {/* <div className="space-y-2">
              <p className="font-medium">データ更新状況</p>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">最終更新: 2025/01/09 10:30</Badge>
                <Button variant="outline" size="sm">
                  今すぐ更新
                </Button>
              </div>
            </div> */}
          </CardContent>
        </Card>

        {/* アプリ情報 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5" />
              アプリ情報
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">バージョン</span>
                <span className="text-sm">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">最終更新</span>
                <span className="text-sm">2025/01/09</span>
              </div>
            </div>

            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full flex items-center gap-2 bg-transparent"
                onClick={() => window.open("/terms", "_blank")}
              >
                <ExternalLink className="w-4 h-4" />
                利用規約
              </Button>

              <Button
                variant="outline"
                className="w-full flex items-center gap-2 bg-transparent"
                onClick={() => window.open("/privacy", "_blank")}
              >
                <ExternalLink className="w-4 h-4" />
                プライバシーポリシー
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 認証設定 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LogOut className="w-5 h-5" />
              認証設定
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                現在ログイン中です。ログアウトすると再度認証が必要になります。
              </p>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="w-full flex items-center gap-2 bg-transparent text-destructive hover:text-destructive"
              >
                <LogOut className="w-4 h-4" />
                ログアウト
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* PWA情報 */}
        <Card>
          <CardHeader>
            <CardTitle>ホーム画面に追加</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              このサイトをホーム画面に追加すると、アプリのように使用できます。
            </p>
            <Button variant="outline" className="w-full bg-transparent">
              ホーム画面に追加
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
