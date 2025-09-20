"use client";

import { useSession } from "next-auth/react";
import { useCallback } from "react";
import { api } from "@/trpc/react";
import type { ConditionalFieldModel } from "types/item";

export function useCart() {
  const { data: session } = useSession();

  // tRPC queries and mutations for authenticated users
  const {
    data: dbCartItems = [],
    isLoading: isLoadingDbCart,
    refetch: refetchDbCart,
  } = api.cart.getCartItems.useQuery(undefined, {
    enabled: !!session?.user,
  });

  const {
    data: cartSummary,
    refetch: refetchCartSummary,
  } = api.cart.getCartSummary.useQuery(undefined, {
    enabled: !!session?.user,
  });

  const addToDbCartMutation = api.cart.addToCart.useMutation({
    onSuccess: () => {
      void refetchDbCart();
      void refetchCartSummary();
    },
  });

  const updateDbCartMutation = api.cart.updateCartItem.useMutation({
    onSuccess: () => {
      void refetchDbCart();
      void refetchCartSummary();
    },
  });

  const removeFromDbCartMutation = api.cart.removeFromCart.useMutation({
    onSuccess: () => {
      void refetchDbCart();
      void refetchCartSummary();
    },
  });

  const clearDbCartMutation = api.cart.clearCart.useMutation({
    onSuccess: () => {
      void refetchDbCart();
      void refetchCartSummary();
    },
  });

  // Add to cart function - only works for authenticated users
  const addToCart = useCallback(
    async (input: {
      itemId: string;
      quantity: number;
      selectedConditionalFields: ConditionalFieldModel[] | null;
    }) => {
      if (!session?.user) {
        throw new Error("Must be logged in to add items to cart");
      }

      return addToDbCartMutation.mutateAsync({
        itemId: input.itemId,
        quantity: input.quantity,
        selectedConditionalFields: input.selectedConditionalFields,
      });
    },
    [session?.user, addToDbCartMutation]
  );

  // Update cart item - only works for authenticated users
  const updateCartItem = useCallback(
    async (cartItemId: string, quantity: number, selectedConditionalFields: ConditionalFieldModel[] | null) => {
      if (!session?.user) {
        throw new Error("Must be logged in to update cart items");
      }

      return updateDbCartMutation.mutateAsync({
        cartItemId,
        quantity,
        selectedConditionalFields,
      });
    },
    [session?.user, updateDbCartMutation]
  );

  // Remove from cart - only works for authenticated users
  const removeFromCart = useCallback(
    async (cartItemId: string) => {
      if (!session?.user) {
        throw new Error("Must be logged in to remove cart items");
      }

      return removeFromDbCartMutation.mutateAsync({ cartItemId });
    },
    [session?.user, removeFromDbCartMutation]
  );

  // Clear cart - only works for authenticated users
  const clearCart = useCallback(async () => {
    if (!session?.user) {
      throw new Error("Must be logged in to clear cart");
    }

    return clearDbCartMutation.mutateAsync();
  }, [session?.user, clearDbCartMutation]);

  return {
    cartItems: dbCartItems,
    summary: cartSummary ?? { totalItems: 0, totalPrice: 0, itemCount: 0 },
    isLoading: isLoadingDbCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
  };
}
