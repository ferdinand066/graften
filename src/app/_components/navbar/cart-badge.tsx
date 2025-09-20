"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/lib/hooks/use-cart";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";

export function CartBadge() {
  const { summary, isLoading } = useCart();

  const itemCount = summary?.itemCount || 0;
  const displayCount = itemCount > 9 ? "9+" : itemCount.toString();

  return (
    <Button variant="outline" asChild className="relative">
      <Link href="/cart">
        <ShoppingCart className="h-4 w-4" />
        {itemCount > 0 && !isLoading && (
          <Badge
            variant="destructive"
            className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs font-bold min-w-[1.25rem]"
          >
            {displayCount}
          </Badge>
        )}
      </Link>
    </Button>
  );
}
