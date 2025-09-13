"use client"

import { Button } from "@/components/ui/button"
import { Search, Heart, MapPin, Settings } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { memo } from "react"

const NAV_ITEMS = [
  {
    id: "search",
    label: "検索",
    icon: Search,
    href: "/",
  },
  {
    id: "favorites",
    label: "お気に入り",
    icon: Heart,
    href: "/favorites",
  },
  {
    id: "restaurants",
    label: "レストラン",
    icon: MapPin,
    href: "/restaurants",
  },
  {
    id: "settings",
    label: "設定",
    icon: Settings,
    href: "/settings",
  },
]

const BottomNavigation = memo(function BottomNavigation() {
  const pathname = usePathname()
  const router = useRouter()

  const handleNavigation = (href: string) => {
    if (pathname !== href) {
      router.push(href)
    }
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-around py-3">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Button
                key={item.id}
                variant="ghost"
                size="sm"
                onClick={() => handleNavigation(item.href)}
                className={`flex flex-col items-center gap-2 h-auto py-3 px-4 min-w-[60px] ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon className={`w-6 h-6 ${isActive ? "fill-current" : ""}`} />
                <span className="text-xs font-medium">{item.label}</span>
              </Button>
            )
          })}
        </div>
      </div>
    </nav>
  )
})

export { BottomNavigation }
