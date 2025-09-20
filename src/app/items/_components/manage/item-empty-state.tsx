import { EmptyState, EmptyStateAction, EmptyStateDescription, EmptyStateIcon, EmptyStateTitle } from "@/app/_components/pages/empty-state";
import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";

export function ItemEmptyState({ setIsCreating }: { setIsCreating: (isCreating: boolean) => void }) {
  return (
    <EmptyState>
      <EmptyStateIcon>
        <Package className="h-12 w-12" />
      </EmptyStateIcon>

      <EmptyStateTitle>No items yet</EmptyStateTitle>

      <EmptyStateDescription>
        Start by creating your first item.
      </EmptyStateDescription>

      <EmptyStateAction>
        <Button onClick={() => setIsCreating(true)}>Create Item</Button>
      </EmptyStateAction>
    </EmptyState>
  );
}
