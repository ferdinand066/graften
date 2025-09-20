"use client";

import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { USER_ROLE } from "utils/constants";
import { CartBadge } from "./cart-badge";
import { LogoutButton } from "./logout-button";

export function NavbarAuth() {
  const { data: session } = useSession();
  const userRole = session?.user?.role;

  return (
    <div className="flex items-center gap-6">
      <div className="flex items-center gap-4">
        {(session?.user && userRole === USER_ROLE.USER) && <CartBadge />}
        {!session?.user ? (
          <>
            <Button asChild variant="outline">
              <Link href="/login">
                Sign In
              </Link>
            </Button>
            <Button asChild>
              <Link href="/register">
                Get Started
              </Link>
            </Button>
          </>
        ) : (
          <>
            <span className="text-muted-foreground text-sm">
              Welcome, {session.user.name ?? session.user.email}
            </span>

            <LogoutButton />
          </>
        )}
      </div>
    </div>
  );
}
