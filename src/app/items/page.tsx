import { ItemManagement } from "@/app/items/_components/manage/item-management";
import { auth } from "@/server/auth";
import { USER_ROLE } from "utils/constants";
import { redirect } from "next/navigation";

export default async function ItemsPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== USER_ROLE.ADMIN) {
    redirect("/");
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <ItemManagement />
    </div>
  );
}
