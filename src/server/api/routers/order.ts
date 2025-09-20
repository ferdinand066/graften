import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { conditionalFieldSchema, type ConditionalFieldModel } from "schema/item.schema";

const checkoutSchema = z.object({
  cartItems: z.array(z.object({
    id: z.string(),
    itemId: z.string(),
    itemName: z.string(),
    quantity: z.number().min(1),
    selectedConditionalFields: z.array(conditionalFieldSchema).nullable(),
    totalPrice: z.number(),
  })),
  grandTotal: z.number(),
});

export const orderRouter = createTRPCRouter({
  // Create order from cart (checkout)
  checkout: protectedProcedure
    .input(checkoutSchema)
    .mutation(async ({ ctx, input }) => {
      if (input.cartItems.length === 0) {
        throw new Error("Cart is empty");
      }

      // Generate unique invoice number
      const timestamp = Date.now().toString(36);
      const randomString = Math.random().toString(36).substr(2, 5);
      const invoiceNumber = `INV-${timestamp}-${randomString}`.toUpperCase();

      // Create order with order items in a transaction
      const order = await ctx.db.$transaction(async (tx) => {
        // Create the order
        const newOrder = await tx.order.create({
          data: {
            invoiceNumber,
            createdById: ctx.session.user.id,
            status: 1, // Order status: 1 = pending, 2 = processing, 3 = completed, etc.
            grandTotal: input.grandTotal,
          },
        });

        // Create order items
        const orderItems = await Promise.all(
          input.cartItems.map((cartItem) =>
            tx.orderItem.create({
              data: {
                name: cartItem.itemName,
                quantity: cartItem.quantity,
                selectedConditionalFields: cartItem.selectedConditionalFields ? JSON.parse(JSON.stringify(cartItem.selectedConditionalFields)) as ConditionalFieldModel[] : undefined,
                totalPrice: cartItem.totalPrice,
                itemId: cartItem.itemId,
                createdById: ctx.session.user.id,
                orderId: newOrder.id,
              },
            })
          )
        );

        // Clear the user's cart after successful order creation
        await tx.cartItem.deleteMany({
          where: {
            createdById: ctx.session.user.id,
          },
        });

        return {
          ...newOrder,
          orderItems,
        };
      });

      return order;
    }),

  // Get user's orders
  getUserOrders: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const orders = await ctx.db.order.findMany({
        where: {
          createdById: ctx.session.user.id,
        },
        include: {
          orderItems: {
            include: {
              item: {
                select: {
                  name: true,
                  slug: true,
                  category: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
      });

      let nextCursor: string | undefined = undefined;
      if (orders.length > input.limit) {
        const nextItem = orders.pop();
        nextCursor = nextItem!.id;
      }

      return {
        orders,
        nextCursor,
      };
    }),

  // Get order by ID
  getOrderById: protectedProcedure
    .input(z.object({ orderId: z.string() }))
    .query(async ({ ctx, input }) => {
      const order = await ctx.db.order.findUnique({
        where: {
          id: input.orderId,
          createdById: ctx.session.user.id, // Ensure user can only see their own orders
        },
        include: {
          orderItems: {
            include: {
              item: {
                select: {
                  name: true,
                  slug: true,
                  price: true,
                  category: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!order) {
        throw new Error("Order not found or access denied");
      }

      return order;
    }),
});
