import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { conditionalFieldSchema, type ConditionalFieldModel } from "schema/item.schema";
import { z } from "zod";

const addToCartSchema = z.object({
  itemId: z.string(),
  quantity: z.number().min(1),
  selectedConditionalFields: z.array(conditionalFieldSchema).nullable(),
});

const updateCartItemSchema = z.object({
  cartItemId: z.string(),
  quantity: z.number().min(1),
  selectedConditionalFields: z.array(conditionalFieldSchema).nullable(),
});

export const cartRouter = createTRPCRouter({
  // Get all cart items for authenticated user
  getCartItems: protectedProcedure.query(async ({ ctx }) => {
    const cartItems = await ctx.db.cartItem.findMany({
      where: {
        createdById: ctx.session.user.id,
      },
      include: {
        item: {
          include: {
            category: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return cartItems.map((cartItem) => ({
      id: cartItem.id,
      itemId: cartItem.item.id,
      itemName: cartItem.item.name,
      itemSlug: cartItem.item.slug,
      itemPrice: cartItem.item.price ?? 0,
      categoryName: cartItem.item.category.name,
      quantity: cartItem.quantity,
      selectedConditionalFields: cartItem.selectedConditionalFields as ConditionalFieldModel[] | null,
      totalPrice: calculateCartItemTotalPrice(
        cartItem.item.price ?? 0,
        cartItem.quantity,
(cartItem.selectedConditionalFields as unknown) as ConditionalFieldModel[] | null
      ),
      createdAt: cartItem.createdAt,
      // Add item validation properties
      minimumQuantity: cartItem.item.minimumQuantity,
      maximumQuantity: cartItem.item.maximumQuantity,
      circulation: cartItem.item.circulation,
    }));
  }),

  // Add item to cart
  addToCart: protectedProcedure
    .input(addToCartSchema)
    .mutation(async ({ ctx, input }) => {
      // Check if item exists
      const item = await ctx.db.item.findUnique({
        where: { id: input.itemId },
        include: { category: true },
      });

      if (!item) {
        throw new Error("Item not found");
      }

      // Create new cart item
      const cartItem = await ctx.db.cartItem.create({
        data: {
          createdById: ctx.session.user.id,
          itemId: input.itemId,
          quantity: input.quantity,
          selectedConditionalFields: input.selectedConditionalFields ? JSON.parse(JSON.stringify(input.selectedConditionalFields)) as ConditionalFieldModel[] : undefined,
        },
        include: {
          item: {
            include: {
              category: true,
            },
          },
        },
      });

      return {
        id: cartItem.id,
        itemId: cartItem.item.id,
        itemName: cartItem.item.name,
        itemSlug: cartItem.item.slug,
        itemPrice: cartItem.item.price ?? 0,
        categoryName: cartItem.item.category.name,
        quantity: cartItem.quantity,
        selectedConditionalFields: cartItem.selectedConditionalFields as ConditionalFieldModel[] | null,
        totalPrice: calculateCartItemTotalPrice(
          cartItem.item.price ?? 0,
          cartItem.quantity,
  (cartItem.selectedConditionalFields as unknown) as ConditionalFieldModel[] | null
        ),
        createdAt: cartItem.createdAt,
        minimumQuantity: cartItem.item.minimumQuantity,
        maximumQuantity: cartItem.item.maximumQuantity,
        circulation: cartItem.item.circulation,
      };
    }),

  // Update cart item quantity
  updateCartItem: protectedProcedure
    .input(updateCartItemSchema)
    .mutation(async ({ ctx, input }) => {
      const cartItem = await ctx.db.cartItem.findUnique({
        where: { id: input.cartItemId },
        include: {
          item: {
            include: {
              category: true,
            },
          },
        },
      });

      if (!cartItem || cartItem.createdById !== ctx.session.user.id) {
        throw new Error("Cart item not found or unauthorized");
      }

      const updatedCartItem = await ctx.db.cartItem.update({
        where: { id: input.cartItemId },
        data: {
          quantity: input.quantity,
          selectedConditionalFields: input.selectedConditionalFields ? JSON.parse(JSON.stringify(input.selectedConditionalFields)) as ConditionalFieldModel[] : undefined,
          updatedAt: new Date(),
        },
        include: {
          item: {
            include: {
              category: true,
            },
          },
        },
      });

      return {
        id: updatedCartItem.id,
        itemId: updatedCartItem.item.id,
        itemName: updatedCartItem.item.name,
        itemSlug: updatedCartItem.item.slug,
        itemPrice: updatedCartItem.item.price ?? 0,
        categoryName: updatedCartItem.item.category.name,
        quantity: updatedCartItem.quantity,
        selectedConditionalFields: updatedCartItem.selectedConditionalFields as ConditionalFieldModel[] | null,
        totalPrice: calculateCartItemTotalPrice(
          updatedCartItem.item.price ?? 0,
          updatedCartItem.quantity,
(updatedCartItem.selectedConditionalFields as unknown) as ConditionalFieldModel[] | null
        ),
        createdAt: updatedCartItem.createdAt,
        minimumQuantity: updatedCartItem.item.minimumQuantity,
        maximumQuantity: updatedCartItem.item.maximumQuantity,
        circulation: updatedCartItem.item.circulation,
      };
    }),

  // Remove item from cart
  removeFromCart: protectedProcedure
    .input(z.object({ cartItemId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const cartItem = await ctx.db.cartItem.findUnique({
        where: { id: input.cartItemId },
      });

      if (!cartItem || cartItem.createdById !== ctx.session.user.id) {
        throw new Error("Cart item not found or unauthorized");
      }

      await ctx.db.cartItem.delete({
        where: { id: input.cartItemId },
      });

      return { success: true };
    }),

  // Clear all cart items for user
  clearCart: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.db.cartItem.deleteMany({
      where: {
        createdById: ctx.session.user.id,
      },
    });

    return { success: true };
  }),

  // Get cart summary (total items, total price)
  getCartSummary: protectedProcedure.query(async ({ ctx }) => {
    const cartItems = await ctx.db.cartItem.findMany({
      where: {
        createdById: ctx.session.user.id,
      },
      include: {
        item: true,
      },
    });

    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cartItems.reduce((sum, cartItem) => {
      return sum + calculateCartItemTotalPrice(
        cartItem.item.price ?? 0,
        cartItem.quantity,
(cartItem.selectedConditionalFields as unknown) as ConditionalFieldModel[] | null
      );
    }, 0);

    return {
      totalItems,
      totalPrice,
      itemCount: cartItems.length,
    };
  }),
});

// Helper function to calculate total price for a cart item including conditional field options
function calculateCartItemTotalPrice(
  basePrice: number,
  quantity: number,
  selectedConditionalFields: ConditionalFieldModel[] | null
): number {
  // Helper function to calculate conditional field price (same as in cart page)
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

  const optionsPrice = calculateConditionalFieldPrice(selectedConditionalFields);
  return (basePrice + optionsPrice) * quantity;
}
