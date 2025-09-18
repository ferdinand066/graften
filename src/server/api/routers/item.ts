import { z } from "zod";

import {
  adminProcedure,
  createTRPCRouter,
  protectedProcedure,
  publicProcedure
} from "@/server/api/trpc";

export const itemRouter = createTRPCRouter({
  create: adminProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required"),
        description: z.string().optional(),
        price: z.number().min(0).optional(),
        minimumQuantity: z.number().int().min(0).default(0),
        maximumQuantity: z.number().int().min(0).optional(),
        circulation: z.number().int().min(0).default(0),
        status: z.number().int().min(0).default(1),
        conditionalFields: z.any().optional(),
        categoryId: z.string().min(1, "Category is required"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.item.create({
        data: {
          name: input.name,
          description: input.description,
          price: input.price,
          minimumQuantity: input.minimumQuantity,
          maximumQuantity: input.maximumQuantity,
          circulation: input.circulation,
          status: input.status,
          conditionalFields: input.conditionalFields,
          createdBy: { connect: { id: ctx.session.user.id } },
          category: { connect: { id: input.categoryId } },
        },
      });
    }),

  getAll: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        cursor: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const items = await ctx.db.item.findMany({
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: { createdAt: "desc" },
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      let nextCursor: typeof input.cursor | undefined = undefined;
      if (items.length > input.limit) {
        const nextItem = items.pop();
        nextCursor = nextItem!.id;
      }

      return {
        items,
        nextCursor,
      };
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const item = await ctx.db.item.findFirst({
        where: {
          id: input.id,
        },
      });

      if (!item) {
        throw new Error("Item not found");
      }

      return item;
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1, "Name is required").optional(),
        description: z.string().optional(),
        price: z.number().min(0).optional(),
        minimumQuantity: z.number().int().min(0).optional(),
        maximumQuantity: z.number().int().min(0).optional(),
        circulation: z.number().int().min(0).optional(),
        status: z.number().int().min(0).optional(),
        conditionalFields: z.any().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      const existingItem = await ctx.db.item.findFirst({
        where: {
          id,
          createdBy: { id: ctx.session.user.id },
        },
      });

      if (!existingItem) {
        throw new Error("Item not found");
      }

      return ctx.db.item.update({
        where: { id },
        data: updateData,
      });
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existingItem = await ctx.db.item.findFirst({
        where: {
          id: input.id,
          createdBy: { id: ctx.session.user.id },
        },
      });

      if (!existingItem) {
        throw new Error("Item not found");
      }

      return ctx.db.item.delete({
        where: { id: input.id },
      });
    }),

  getLatest: protectedProcedure.query(async ({ ctx }) => {
    const item = await ctx.db.item.findFirst({
      orderBy: { createdAt: "desc" },
      where: { createdBy: { id: ctx.session.user.id } },
    });

    return item ?? null;
  }),

  search: protectedProcedure
    .input(
      z.object({
        query: z.string().min(1),
        limit: z.number().min(1).max(50).default(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.item.findMany({
        where: {
          createdBy: { id: ctx.session.user.id },
          name: {
            contains: input.query,
            search: "insensitive",
          },
        },
        orderBy: { createdAt: "desc" },
        take: input.limit,
      });
    }),
});
