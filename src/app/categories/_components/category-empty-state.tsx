
import { EmptyState, EmptyStateAction, EmptyStateDescription, EmptyStateIcon, EmptyStateTitle } from "@/app/_components/pages/empty-state";
import { Button } from "@/components/ui/button";
import { Inbox } from "lucide-react";

export function CategoryEmptyState({ setIsCreating }: { setIsCreating: (isCreating: boolean) => void }) {
  return (
    <EmptyState>
      <EmptyStateIcon>
        <Inbox className="h-12 w-12" />
      </EmptyStateIcon>

      <EmptyStateTitle>No items yet</EmptyStateTitle>

      <EmptyStateDescription>
        Start by creating your first category.
      </EmptyStateDescription>

      <EmptyStateAction>
        <Button onClick={() => setIsCreating(true)}>Create Category</Button>
      </EmptyStateAction>
    </EmptyState>
  );
}
