"use client";

import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { signOut, useSession } from "next-auth/react";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import { USER_ROLE } from "utils/constants";

const navItemClass = navigationMenuTriggerStyle();

export function ClientNavbar() {
  const { data: session, status } = useSession();
  const userRole = session?.user?.role;

  if (status === "loading") {
    return (
      <nav className="w-full p-6 bg-background shadow-sm border-b">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex flex-row gap-4">
            <Link href="/" className="text-2xl font-bold text-foreground hover:text-primary transition">
              Graften <span className="text-primary">Digital</span>
            </Link>
          </div>
          <div className="flex items-center gap-6">
            <div className="animate-pulse bg-muted h-8 w-20 rounded"></div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="w-full p-6 bg-background shadow-sm border-b">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex flex-row gap-4">
          <Link href="/" className="text-2xl font-bold text-foreground hover:text-primary transition">
            Graften <span className="text-primary">Digital</span>
          </Link>
          <NavigationMenu>
            <NavigationMenuList>
              {!session?.user && (
                <>
                  <NavigationMenuItem>
                    <NavigationMenuLink asChild className={navItemClass}>
                      <Link href="/" className={navItemClass}>Home</Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuLink asChild className={navItemClass}>
                      <Link href="/items" className={navItemClass}>Items</Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                </>
              )}

              {session?.user && userRole === USER_ROLE.USER && (
                <NavigationMenuItem>
                  <NavigationMenuLink asChild className={navItemClass}>
                    <Link href="/items" className={navItemClass}>Items</Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              )}

              {session?.user && userRole === USER_ROLE.ADMIN && (
                <>
                  <NavigationMenuItem>
                    <NavigationMenuLink asChild className={navItemClass}>
                      <Link href="/orders" className={navItemClass}>Orders</Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuLink asChild className={navItemClass}>
                      <Link href="/items" className={navItemClass}>Items</Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                </>
              )}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
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
                {userRole === USER_ROLE.USER && (
                  <Button variant="outline" size="sm">
                    <ShoppingCart className="h-4 w-4" />
                  </Button>
                )}

                <span className="text-muted-foreground text-sm">
                  Welcome, {session.user.name || session.user.email}
                </span>

                <Button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  variant="destructive"
                  size="sm"
                >
                  Sign Out
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
