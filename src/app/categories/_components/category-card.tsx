import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Category } from "@prisma/client";

type CategoryWithItems = Category & {
  _count: {
    items: number;
  };
};

type CategoryCardProps = {
  category: CategoryWithItems;
  isCreating: boolean;
  handleEdit: (category: CategoryWithItems) => void;
  handleDelete: (id: string, name: string) => void;
  isDeleting: boolean;
}

export function CategoryCard({ category, isCreating, handleEdit, handleDelete, isDeleting }: CategoryCardProps) {
  return (
    <Card key={category.id}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-card-foreground mb-2">
              {category.name}
            </h3>
            {category.description && (
              <p className="text-muted-foreground mb-3 leading-relaxed">{category.description}</p>
            )}
            <div className="flex gap-4">
              <Badge variant="secondary" className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                {category._count.items} items
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {new Date(category.createdAt).toLocaleDateString()}
              </Badge>
            </div>
          </div>
          {
            !isCreating && <div className="flex gap-2 ml-4">
              <Button
                onClick={() => handleEdit(category)}
                size="sm"
                variant="outline"
              >
                Edit
              </Button>
              <Button
                onClick={() => handleDelete(category.id, category.name)}
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
