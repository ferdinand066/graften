import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import { USER_ROLE } from "utils/constants";
import { OrderHistoryList } from "./_components/order-history-list";
import { PageHeader, PageHeaderContent, PageHeaderDescription, PageHeaderTitle } from "../_components/pages/page-header";

export default async function HistoryPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== USER_ROLE.USER) {
    redirect("/");
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      <PageHeader>
        <PageHeaderContent>
          <PageHeaderTitle>Order History</PageHeaderTitle>
          <PageHeaderDescription>
          View and track all your orders
          </PageHeaderDescription>
        </PageHeaderContent>
      </PageHeader>
      <OrderHistoryList />
    </div>
  );
}
