import { z } from "zod";

import {
  adminProcedure,
  createTRPCRouter,
  publicProcedure,
} from "@/server/api/trpc";

export const categoryRouter = createTRPCRouter({
  create: adminProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
        description: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.category.create({
        data: {
          name: input.name,
          description: input.description,
          createdBy: { connect: { id: ctx.session.user.id } },
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
      const categories = await ctx.db.category.findMany({
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: {
              items: true,
            },
          },
        },
      });

      let nextCursor: typeof input.cursor | undefined = undefined;
      if (categories.length > input.limit) {
        const nextCategory = categories.pop();
        nextCursor = nextCategory!.id;
      }

      return {
        categories,
        nextCursor,
      };
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const category = await ctx.db.category.findFirst({
        where: {
          id: input.id,
        },
        include: {
          _count: {
            select: {
              items: true,
            },
          },
        },
      });

      if (!category) {
        throw new Error("Category not found");
      }

      return category;
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters").optional(),
        description: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      const existingCategory = await ctx.db.category.findFirst({
        where: {
          id,
          createdById: ctx.session.user.id,
        },
      });

      if (!existingCategory) {
        throw new Error("Category not found or you don't have permission to update it");
      }

      return ctx.db.category.update({
        where: { id },
        data: updateData,
      });
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existingCategory = await ctx.db.category.findFirst({
        where: {
          id: input.id,
          createdById: ctx.session.user.id,
        },
        include: {
          _count: {
            select: {
              items: true,
            },
          },
        },
      });

      if (!existingCategory) {
        throw new Error("Category not found or you don't have permission to delete it");
      }

      // Check if category has items
      if (existingCategory._count.items > 0) {
        throw new Error("Cannot delete category that has items. Please move or delete items first.");
      }

      return ctx.db.category.delete({
        where: { id: input.id },
      });
    }),

  search: publicProcedure
    .input(
      z.object({
        query: z.string().min(1),
        limit: z.number().min(1).max(50).default(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.category.findMany({
        where: {
          name: {
            contains: input.query,
          },
        },
        orderBy: { createdAt: "desc" },
        take: input.limit,
        include: {
          _count: {
            select: {
              items: true,
            },
          },
        },
      });
    }),
});
