"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCart } from "@/lib/hooks/use-cart";
import { formatCurrency } from "@/lib/utils";
import { api } from "@/trpc/react";
import { Info, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import type { CartItem } from "types/cart";
import type { ConditionalFieldModel } from "types/item";

// Helper function to convert ConditionalFieldModel to display text
const formatConditionalFields = (conditionalFields: ConditionalFieldModel[] | null): string => {
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
const calculateConditionalFieldPrice = (conditionalFields: ConditionalFieldModel[] | null): number => {
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

export default function CartDetail() {
  const { cartItems, summary, isLoading, updateCartItem, removeFromCart, clearCart } = useCart();
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const router = useRouter();
  const { data: session } = useSession();

  // Checkout mutation
  const checkoutMutation = api.order.checkout.useMutation({
    onSuccess: (order) => {
      toast.success("Order placed successfully!", {
        description: `Order #${order.invoiceNumber} has been created.`,
        classNames: {
          description: "!text-gray-600",
        }
      });
      // Redirect to order confirmation or orders page
      router.push(`/orders/${order.id}`);
    },
    onError: (error) => {
      toast.error("Checkout failed", {
        description: error.message || "Please try again later.",
      });
    },
  });

  // Helper function to find the closest valid quantity based on circulation rules
  const findClosestValidQuantity = useCallback((
    targetQuantity: number,
    minQuantity: number,
    maxQuantity: number | null,
    circulation: number
  ): number => {
    if (targetQuantity < minQuantity) return minQuantity;

    if (maxQuantity && targetQuantity > maxQuantity) return maxQuantity;

    // If circulation is 1, any quantity within min/max is valid
    if (circulation <= 1) {
      return Math.max(minQuantity, Math.min(targetQuantity, maxQuantity ?? targetQuantity));
    }

    // Find the closest valid quantity that follows circulation rules
    // Valid quantities are: minQuantity, minQuantity + circulation, minQuantity + 2*circulation, etc.
    const baseQuantity = Math.floor((targetQuantity - minQuantity) / circulation) * circulation + minQuantity;
    const nextQuantity = baseQuantity + circulation;

    // Choose the closer one, but respect max quantity
    const distanceToBase = Math.abs(targetQuantity - baseQuantity);
    const distanceToNext = Math.abs(targetQuantity - nextQuantity);

    if (distanceToBase <= distanceToNext) {
      return Math.max(minQuantity, Math.min(baseQuantity, maxQuantity ?? baseQuantity));
    } else {
      const validNext = Math.max(minQuantity, Math.min(nextQuantity, maxQuantity ?? nextQuantity));
      return maxQuantity && validNext > maxQuantity ? baseQuantity : validNext;
    }
  }, []);

  const handleQuantityUpdate = async (
    cartItemId: string,
    newQuantity: number,
    selectedConditionalFields: ConditionalFieldModel[] | null,
    minQuantity: number,
    maxQuantity: number | null,
    circulation: number
  ) => {
    if (newQuantity < 1) return;

    // Validate quantity using the same logic as item detail
    const validQuantity = findClosestValidQuantity(newQuantity, minQuantity, maxQuantity, circulation);

    setIsUpdating(cartItemId);
    try {
      await updateCartItem(cartItemId, validQuantity, selectedConditionalFields);
      if (validQuantity !== newQuantity) {
        toast.success(`Quantity adjusted to ${validQuantity} (closest valid amount)`);
      } else {
        toast.success("Cart updated successfully");
      }
    } catch (error) {
      console.error("Failed to update cart item:", error);
      toast.error("Failed to update cart item");
    } finally {
      setIsUpdating(null);
    }
  };

  const handleIncrement = (item: CartItem) => {
    const newQuantity = item.quantity + item.circulation;

    // Check if increment would exceed maximum
    if (item.maximumQuantity && newQuantity > item.maximumQuantity) {
      return;
    }

    void handleQuantityUpdate(
      item.id,
      newQuantity,
      item.selectedConditionalFields,
      item.minimumQuantity,
      item.maximumQuantity,
      item.circulation
    );
  };

  const handleDecrement = (item: CartItem) => {
    const newQuantity = item.quantity - item.circulation;

    if (newQuantity >= item.minimumQuantity) {
      void handleQuantityUpdate(
        item.id,
        newQuantity,
        item.selectedConditionalFields,
        item.minimumQuantity,
        item.maximumQuantity,
        item.circulation
      );
    }
  };

  const handleCheckout = async () => {
    // Flow 1: If user is not logged in, redirect to login
    if (!session?.user) {
      toast.info("Please login to proceed with checkout", {
        description: "You'll be redirected to the login page.",
      });
      router.push("/login?redirect=/cart");
      return;
    }

    // Flow 2: If user is logged in, process the order
    if (cartItems.length === 0) {
      toast.error("Cart is empty", {
        description: "Add some items to your cart before checkout.",
      });
      return;
    }

    setIsCheckingOut(true);

    try {
      // Prepare cart items for checkout
      const checkoutItems = cartItems.map((item) => ({
        id: item.id,
        itemId: item.itemId,
        itemName: item.itemName,
        quantity: item.quantity,
        selectedConditionalFields: item.selectedConditionalFields,
        totalPrice: item.totalPrice,
      }));

      await checkoutMutation.mutateAsync({
        cartItems: checkoutItems,
        grandTotal: summary?.totalPrice ?? 0,
      });
    } catch (error) {
      // Error is handled by the mutation's onError callback
      console.error("Checkout error:", error);
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleRemoveItem = async (cartItemId: string) => {
    try {
      await removeFromCart(cartItemId);
      toast.success("Item removed from cart");
    } catch (error) {
      console.error("Failed to remove cart item:", error);
      toast.error("Failed to remove item");
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCart();
      toast.success("Cart cleared successfully");
    } catch (error) {
      console.error("Failed to clear cart:", error);
      toast.error("Failed to clear cart");
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center py-12">
          <ShoppingBag className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add some items to your cart to get started!</p>
          <Button asChild>
            <Link href="/items">
              Browse Items
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Shopping Cart</h1>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            Synced to account
          </Badge>
          {cartItems.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleClearCart}>
              Clear Cart
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <Card key={item.id} className="p-6">
              <div className="flex items-start gap-4">
                {/* Item Image */}
                <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-md flex-shrink-0">
                  <Image
                    src={`https://api.dicebear.com/9.x/glass/svg?seed=${item.itemName}`}
                    alt={item.itemName}
                    width={80}
                    height={80}
                    className="w-full h-full rounded-md"
                    unoptimized={true}
                  />
                </div>

                {/* Item Details */}
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-lg">{item.itemName}</h3>
                      <Badge variant="outline" className="text-xs">
                        {item.categoryName}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Selected Options */}
                  {item.selectedConditionalFields && (
                    <div className="mb-3">
                      <p className="text-sm text-gray-600 mb-1">Selected options:</p>
                      <div className="space-y-1">
                        <div className="text-sm text-gray-700">
                          {formatConditionalFields(item.selectedConditionalFields)}
                          {(() => {
                            const optionPrice = calculateConditionalFieldPrice(item.selectedConditionalFields);
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

                  {/* Quantity and Price */}
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDecrement(item)}
                          disabled={item.quantity - item.circulation < item.minimumQuantity || isUpdating === item.id}
                          className="h-8 w-8 p-0"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="font-medium px-3">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleIncrement(item)}
                          disabled={
                            (item.maximumQuantity ? item.quantity + item.circulation > item.maximumQuantity : false) ||
                            isUpdating === item.id
                          }
                          className="h-8 w-8 p-0"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      {/* Quantity Constraints */}
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <Info className="h-3 w-3" />
                        <div className="flex gap-2">
                          <span>Min: {item.minimumQuantity}</span>
                          {item.maximumQuantity && (
                            <span>Max: {item.maximumQuantity}</span>
                          )}
                          {item.circulation > 1 && (
                            <span>Step: {item.circulation}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>
                          Base: <span className="font-medium">${formatCurrency(item.itemPrice)}</span> × {item.quantity}
                        </div>
                        {(() => {
                          const optionPrice = calculateConditionalFieldPrice(item.selectedConditionalFields);
                          return optionPrice > 0 && (
                            <div className="text-xs text-green-600">
                              Options: +${formatCurrency(optionPrice)} × {item.quantity}
                            </div>
                          );
                        })()}
                        <div className="text-xs text-gray-500 border-t pt-1">
                          {(() => {
                            const optionPrice = calculateConditionalFieldPrice(item.selectedConditionalFields);
                            const baseTotal = item.itemPrice * item.quantity;
                            const optionsTotal = optionPrice * item.quantity;
                            return (
                              <>
                                {baseTotal > 0 && <div>Base: ${formatCurrency(baseTotal)}</div>}
                                {optionsTotal > 0 && <div>Options: ${formatCurrency(optionsTotal)}</div>}
                              </>
                            );
                          })()}
                        </div>
                      </div>
                      <div className="font-semibold text-lg mt-2">
                        ${formatCurrency(item.totalPrice)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="p-6 sticky top-4">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span>Items ({summary?.itemCount})</span>
                <span>${formatCurrency(summary?.totalPrice || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Quantity</span>
                <span>{summary?.totalItems || 0}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>${formatCurrency(summary?.totalPrice || 0)}</span>
                </div>
              </div>
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={handleCheckout}
              disabled={isCheckingOut || cartItems.length === 0}
            >
              {isCheckingOut ? "Processing..." : "Proceed to Checkout"}
            </Button>

            <div className="mt-4 text-center">
              <Button variant="ghost" asChild>
                <Link href="/items">
                  Continue Shopping
                </Link>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
