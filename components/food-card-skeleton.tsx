import { Card, CardContent } from "@/components/ui/card"

export function FoodCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-[4/3] bg-muted animate-pulse" />
      <CardContent className="p-4 space-y-3">
        <div className="space-y-2">
          <div className="h-5 bg-muted rounded animate-pulse" />
          <div className="h-6 bg-muted rounded w-20 animate-pulse" />
          <div className="h-4 bg-muted rounded animate-pulse" />
          <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
        </div>

        <div className="flex gap-1">
          <div className="h-5 bg-muted rounded w-16 animate-pulse" />
          <div className="h-5 bg-muted rounded w-12 animate-pulse" />
          <div className="h-5 bg-muted rounded w-20 animate-pulse" />
        </div>

        <div className="h-3 bg-muted rounded w-32 animate-pulse" />
        <div className="h-4 bg-muted rounded w-24 animate-pulse" />

        <div className="pt-2">
          <div className="h-8 bg-muted rounded w-full animate-pulse" />
        </div>
      </CardContent>
    </Card>
  )
}
