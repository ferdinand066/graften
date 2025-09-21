"use client";

import { Button } from "@/components/ui/button";
import { History } from "lucide-react";
import Link from "next/link";

export function HistoryBadge() {
  return (
    <Button variant="outline" asChild>
      <Link href="/history">
        <History className="h-4 w-4" />
      </Link>
    </Button>
  );
}
