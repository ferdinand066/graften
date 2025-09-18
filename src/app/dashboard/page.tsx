import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { api, HydrateClient } from "@/trpc/server";
import { ItemManagement } from "@/app/items/_components/manage/item-management";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  void api.item.getAll.prefetch({ limit: 50 });

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col bg-gradient-to-br from-primary/5 to-background">

        <div className="flex-1 container mx-auto px-6 py-12">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">Dashboard</h1>
            <p className="text-xl text-muted-foreground">
              Welcome to your dashboard, {session.user.name || session.user.email}!
            </p>
          </div>

          <ItemManagement />
        </div>
      </main>
    </HydrateClient>
  );
}
