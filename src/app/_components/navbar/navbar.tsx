import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { auth } from "@/server/auth";
import Link from "next/link";
import { USER_ROLE } from "utils/constants";
import { NavbarAuth } from "./navbar-auth";


const navItemClass = navigationMenuTriggerStyle();

export async function Navbar() {
  const session = await auth();
  const userRole = session?.user?.role;

  return (
    <nav className="w-full p-6 bg-background shadow-sm border-b border-border">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex flex-row gap-4">
          <Link href="/" className="text-2xl font-bold text-foreground hover:text-primary transition">
            Graften <span className="text-primary">Digital</span>
          </Link>
          <NavigationMenu>
            <NavigationMenuList>
              {!(session?.user && userRole === USER_ROLE.ADMIN) && (
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

              {session?.user && userRole === USER_ROLE.ADMIN && (
                <>
                  <NavigationMenuItem>
                    <NavigationMenuLink asChild className={navItemClass}>
                      <Link href="/orders" className={navItemClass}>Orders</Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuLink asChild className={navItemClass}>
                      <Link href="/categories" className={navItemClass}>Category</Link>
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

        <NavbarAuth />
      </div>
    </nav>
  );
}
