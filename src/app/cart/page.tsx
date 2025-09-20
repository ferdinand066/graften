import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import { USER_ROLE } from "utils/constants";
import CartDetail from "./_components/cart-detail";

export default async function CartPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== USER_ROLE.USER) {
    redirect("/");
  }

  return (
    <CartDetail />
  );
}
