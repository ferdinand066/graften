import { ItemManagement } from "@/app/items/_components/manage/core/item-management";
import { auth } from "@/server/auth";
import { USER_ROLE } from "utils/constants";
import { ItemPreview } from "./_components/preview/item-preview";

export default async function ItemsPage() {
  const session = await auth();

  const isAdmin = !!session?.user && session?.user.role === USER_ROLE.ADMIN;

  return (
    <div className="container mx-auto py-8 px-4">
      { isAdmin ? <ItemManagement /> : <ItemPreview /> }
    </div>
  );
}
