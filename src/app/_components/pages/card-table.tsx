import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"

interface CardTableProps<T> {
  data: T[]
  renderItem: (item: T, index: number) => React.ReactNode
  emptyState?: React.ReactNode
  loading?: boolean
  loadingSkeleton?: React.ReactNode
  className?: string
}

function CardTable<T>({
  data,
  renderItem,
  emptyState,
  loading = false,
  loadingSkeleton,
  className
}: CardTableProps<T>) {
  if (loading) {
    return loadingSkeleton ?? <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  }

  if (data.length === 0) {
    return emptyState ?? null;
  }

  return (
    <div className={cn("space-y-4", className)}>
      {data.map((item, index) => renderItem(item, index))}
    </div>
  )
}

export { CardTable }
