import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { USER_ROLE } from "utils/constants";

export default async function OrdersPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== USER_ROLE.ADMIN) {
    redirect("/");
  }

  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-br from-primary/5 to-background">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Orders Management</h1>
          <p className="text-muted-foreground">Manage customer orders and fulfillment</p>
        </div>

        <div className="bg-card rounded-lg shadow-sm p-6">
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-card-foreground mb-2">Orders Dashboard</h2>
            <p className="text-muted-foreground">Order management functionality will be implemented here.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
