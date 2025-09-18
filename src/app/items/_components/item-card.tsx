import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { ItemModel } from "types/item";


type ItemCardProps = {
  item: ItemModel;
  isCreating: boolean;
  handleEdit: (item: ItemModel) => void;
  handleDelete: (id: string, name: string) => void;
  isDeleting: boolean;
}

export function ItemCard({ item, isCreating, handleEdit, handleDelete, isDeleting }: ItemCardProps) {
  return (
    <Card key={item.id}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-card-foreground mb-2">
              {item.name}
            </h3>
            {item.description && (
              <p className="text-muted-foreground mb-3 leading-relaxed">{item.description}</p>
            )}
            <div className="flex gap-4 flex-wrap">
              <Badge variant="secondary" className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                {item.category.name}
              </Badge>
              {item.price && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  ${item.price.toFixed(2)}
                </Badge>
              )}
              <Badge variant="outline" className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                Min: {item.minimumQuantity} {item.maximumQuantity ? `| Max: ${item.maximumQuantity}` : ''}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Circulation: {item.circulation}
              </Badge>
              <Badge variant={item.status === 1 ? "default" : "secondary"} className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {item.status === 1 ? 'Active' : 'Inactive'}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {new Date(item.createdAt).toLocaleDateString()}
              </Badge>
            </div>
          </div>
          {
            !isCreating && <div className="flex gap-2 ml-4">
              <Button
                onClick={() => handleEdit(item)}
                size="sm"
                variant="outline"
              >
                Edit
              </Button>
              <Button
                onClick={() => handleDelete(item.id, item.name)}
                disabled={isDeleting}
                size="sm"
                variant="destructive"
              >
                {isDeleting ? "..." : "Delete"}
              </Button>
            </div>
          }
        </div>
      </CardContent>
    </Card>
  )
}
