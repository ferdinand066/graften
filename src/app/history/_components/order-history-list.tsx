"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { api } from "@/trpc/react";
import { AlertCircle, CheckCircle, Clock, Package, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { CardTable } from "@/app/_components/pages/card-table";
import {
  EmptyState,
  EmptyStateIcon,
  EmptyStateTitle,
  EmptyStateDescription,
  EmptyStateAction
} from "@/app/_components/pages/empty-state";
import { DataPagination } from "@/app/_components/pages/data-pagination";
import { OrdersEmptyState } from "./orders-empty-state";
import type { OrderModel } from "types/order";
import type { OrderItem } from "@prisma/client";

// Helper function to get status information
const getStatusInfo = (status: number) => {
  switch (status) {
    case 1:
      return { label: "Pending", color: "bg-yellow-100 text-yellow-800", icon: Clock };
    case 2:
      return { label: "Processing", color: "bg-blue-100 text-blue-800", icon: Package };
    case 3:
      return { label: "Completed", color: "bg-green-100 text-green-800", icon: CheckCircle };
    default:
      return { label: "Unknown", color: "bg-gray-100 text-gray-800", icon: AlertCircle };
  }
};

export function OrderHistoryList() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: orderData, isLoading, error } = api.order.getUserOrders.useQuery({
    limit: itemsPerPage,
    page: currentPage,
  });

  console.log(orderData);

  const orders = orderData?.orders ?? [];
  const pagination = orderData?.pagination;

  const renderOrderItem = (order: OrderModel) => {
    const statusInfo = getStatusInfo(order.status);
    const StatusIcon = statusInfo.icon;

    return (
      <Card key={order.id} className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            {/* Order Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-semibold text-lg">#{order.invoiceNumber}</h3>
                <div className="flex items-center gap-2">
                  <StatusIcon className="h-4 w-4" />
                  <Badge className={statusInfo.color}>
                    {statusInfo.label}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Date:</span>{" "}
                  {new Date(order.createdAt).toLocaleDateString()}
                </div>
                <div>
                  <span className="font-medium">Items:</span>{" "}
                  {order.orderItems?.length ?? 0} item(s)
                </div>
                <div>
                  <span className="font-medium">Total:</span>{" "}
                  <span className="font-semibold text-lg text-gray-900">
                    ${formatCurrency(order.grandTotal)}
                  </span>
                </div>
              </div>

              {/* Order Items Preview */}
              <div className="mt-3">
                <div className="flex flex-wrap gap-1">
                  {order.orderItems?.slice(0, 3).map((item: OrderItem) => (
                    <Badge key={item.id} variant="outline" className="text-xs">
                      {item.name} (x{item.quantity})
                    </Badge>
                  ))}
                  {(order.orderItems?.length ?? 0) > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{(order.orderItems?.length ?? 0) - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href={`/orders/${order.id}`}>
                  View Details
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const loadingSkeleton = (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="animate-pulse">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-6 bg-gray-200 rounded w-32"></div>
                  <div className="h-5 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="h-8 bg-gray-200 rounded w-24"></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-4 bg-gray-200 rounded w-28"></div>
              </div>
              <div className="flex gap-1">
                <div className="h-5 bg-gray-200 rounded w-16"></div>
                <div className="h-5 bg-gray-200 rounded w-20"></div>
                <div className="h-5 bg-gray-200 rounded w-18"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  if (error) {
    return (
      <EmptyState>
        <EmptyStateIcon>
          <AlertCircle className="h-12 w-12 text-red-500" />
        </EmptyStateIcon>
        <EmptyStateTitle>Error Loading Orders</EmptyStateTitle>
        <EmptyStateDescription>
          There was an error loading your order history. Please try again later.
        </EmptyStateDescription>
        <EmptyStateAction>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </EmptyStateAction>
      </EmptyState>
    );
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // return (
  //   <div className={className}>
  //     <CardTable
  //       data={orders}
  //       renderItem={renderOrderItem}
  //       emptyState={emptyState}
  //       loading={isLoading}
  //       loadingSkeleton={loadingSkeleton}
  //     />

  //     {/* Pagination */}
  //     {pagination && (
  //       <DataPagination
  //         pagination={pagination}
  //         onPageChange={handlePageChange}
  //         className="mt-6"
  //       />
  //     )}
  //   </div>
  // );
  return (
    <>
      <CardTable
        data={orders}
        loading={isLoading}
        emptyState={
          <OrdersEmptyState />
        }
        renderItem={renderOrderItem}
        loadingSkeleton={loadingSkeleton}
      />

      {pagination && (
        <DataPagination
          pagination={pagination}
          onPageChange={handlePageChange}
        />
      )}
    </>
  )
}
