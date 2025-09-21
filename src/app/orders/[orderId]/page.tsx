"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { api } from "@/trpc/react";
import type { ConditionalFieldModel } from "types/item";
import { AlertCircle, CheckCircle, Clock, Package } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";

// Helper function to convert ConditionalFieldModel to display text
const formatConditionalFields = (conditionalFields: ConditionalFieldModel[] | null | undefined): string => {
  if (!conditionalFields || !Array.isArray(conditionalFields)) return "";

  const formatField = (field: ConditionalFieldModel): string => {
    if (!field || typeof field !== 'object') return "";

    let result = field.text ?? "";

    // If field has children, format them recursively
    if (field.children && Array.isArray(field.children) && field.children.length > 0) {
      const childTexts = field.children.map(formatField).filter(Boolean);
      if (childTexts.length > 0) {
        result += " → " + childTexts.join(", ");
      }
    }

    return result;
  };

  return conditionalFields.map(formatField).filter(Boolean).join(", ");
};

// Helper function to calculate total price from ConditionalFieldModel
const calculateConditionalFieldPrice = (conditionalFields: ConditionalFieldModel[] | null | undefined): number => {
  if (!conditionalFields || !Array.isArray(conditionalFields)) return 0;

  const calculateFieldPrice = (field: ConditionalFieldModel): number => {
    if (!field || typeof field !== 'object') return 0;

    let total = field.value ?? 0;

    // Add prices from children recursively
    if (field.children && Array.isArray(field.children)) {
      total += field.children.reduce((sum: number, child: ConditionalFieldModel) => sum + calculateFieldPrice(child), 0);
    }

    return total;
  };

  return conditionalFields.reduce((sum: number, field: ConditionalFieldModel) => sum + calculateFieldPrice(field), 0);
};

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

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.orderId as string;

  const { data: order, isLoading, error } = api.order.getOrderById.useQuery(
    { orderId },
    { enabled: !!orderId }
  );

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="p-8 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-4">{"The order you're looking for doesn't exist or has been removed."}</p>
          <Button asChild>
            <Link href="/orders">View All Orders</Link>
          </Button>
        </Card>
      </div>
    );
  }

  const statusInfo = getStatusInfo(order.status);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Order Details</h1>
            <p className="text-gray-600">Order #{order.invoiceNumber}</p>
          </div>
          <div className="flex items-center gap-2">
            <StatusIcon className="h-4 w-4" />
            <Badge className={statusInfo.color}>
              {statusInfo.label}
            </Badge>
          </div>
        </div>

        {/* Order Summary */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Order Date</p>
              <p className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-gray-600">Total Amount</p>
              <p className="font-medium text-lg">${formatCurrency(order.grandTotal)}</p>
            </div>
            <div>
              <p className="text-gray-600">Items</p>
              <p className="font-medium">{order.orderItems.length} item(s)</p>
            </div>
          </div>
        </Card>

        {/* Order Items */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Order Items</h2>
          <div className="space-y-4">
            {order.orderItems.map((orderItem) => (
              <div key={orderItem.id} className="flex items-start gap-4 p-4 border rounded-lg">
                {/* Item Image */}
                <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-md flex-shrink-0">
                  <Image
                    src={`https://api.dicebear.com/9.x/glass/svg?seed=${orderItem.name}`}
                    alt={orderItem.name}
                    className="rounded-md"
                    width={64}
                    height={64}
                    unoptimized={true}
                  />
                </div>

                {/* Item Details */}
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold">{orderItem.name}</h3>
                      <Badge variant="outline" className="text-xs">
                        {orderItem.item.category.name}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${formatCurrency(orderItem.totalPrice)}</p>
                      <p className="text-sm text-gray-600">Qty: {orderItem.quantity}</p>
                    </div>
                  </div>

                  {/* Selected Options */}
                  {orderItem.selectedConditionalFields && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 mb-1">Selected options:</p>
                      <div className="space-y-1">
                        <div className="text-sm text-gray-700">
                          {formatConditionalFields(orderItem.selectedConditionalFields as ConditionalFieldModel[] | null)}
                          {(() => {
                            const optionPrice = calculateConditionalFieldPrice(orderItem.selectedConditionalFields as ConditionalFieldModel[] | null);
                            return optionPrice > 0 && (
                              <span className="ml-2 text-green-600">
                                +${formatCurrency(optionPrice)}
                              </span>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button asChild variant="outline">
            <Link href="/orders">← Back to Orders</Link>
          </Button>
          <Button asChild>
            <Link href="/items">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
