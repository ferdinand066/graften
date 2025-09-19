import { z } from "zod";

import {
  adminProcedure,
  createTRPCRouter,
  protectedProcedure,
  publicProcedure
} from "@/server/api/trpc";
import { createItemSchema, updateItemSchema } from "schema/item.schema";
import { executePaginatedQuery } from "@/server/utils/pagination";

export const itemRouter = createTRPCRouter({
  create: adminProcedure
    .input(createItemSchema)
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
          conditionalFields: input.conditionalFields ? JSON.stringify(input.conditionalFields) : undefined,
          createdBy: { connect: { id: ctx.session.user.id } },
          category: { connect: { id: input.categoryId } },
        },
      });
    }),

  getAll: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        page: z.number().min(1).default(1),
        cursor: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const result = await executePaginatedQuery({
        db: ctx.db,
        model: "item",
        input,
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return {
        items: result.items,
        nextCursor: result.nextCursor,
        pagination: result.pagination,
      };
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const item = await ctx.db.item.findFirst({
        where: {
          id: input.id,
          deletedAt: null,
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (!item) {
        throw new Error("Item not found");
      }

      return item;
    }),

  update: adminProcedure
    .input(updateItemSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      const existingItem = await ctx.db.item.findFirst({
        where: {
          id,
          createdBy: { id: ctx.session.user.id },
          deletedAt: null,
        },
      });

      if (!existingItem) {
        throw new Error("Item not found");
      }

      return ctx.db.item.update({
        where: { id },
        data: {
          ...updateData,
          conditionalFields: updateData.conditionalFields ? JSON.stringify(updateData.conditionalFields) : undefined,
        },
      });
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existingItem = await ctx.db.item.findFirst({
        where: {
          id: input.id,
          createdBy: { id: ctx.session.user.id },
          deletedAt: null,
        },
      });

      if (!existingItem) {
        throw new Error("Item not found");
      }

      // Soft delete: set deletedAt timestamp
      return ctx.db.item.update({
        where: { id: input.id },
        data: { deletedAt: new Date() },
      });
    }),

  getLatest: protectedProcedure.query(async ({ ctx }) => {
    const item = await ctx.db.item.findFirst({
      orderBy: { createdAt: "desc" },
      where: {
        createdBy: { id: ctx.session.user.id },
        deletedAt: null,
      },
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
          deletedAt: null,
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
