
import { EmptyState, EmptyStateAction, EmptyStateDescription, EmptyStateIcon, EmptyStateTitle } from "@/app/_components/pages/empty-state";
import { Button } from "@/components/ui/button";
import { Inbox } from "lucide-react";
import Link from "next/link";

export function OrdersEmptyState() {
  return (
    <EmptyState>
      <EmptyStateIcon>
        <Inbox className="h-12 w-12" />
      </EmptyStateIcon>
      <EmptyStateTitle>No Order History</EmptyStateTitle>
      <EmptyStateDescription>
        {"You haven't placed any orders yet. Start shopping to see your order history here."}
      </EmptyStateDescription>
      <EmptyStateAction>
        <Button asChild>
          <Link href="/items">Start Shopping</Link>
        </Button>
      </EmptyStateAction>
    </EmptyState>
  );
}
