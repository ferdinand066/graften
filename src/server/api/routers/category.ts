import { z } from "zod";

import {
  adminProcedure,
  createTRPCRouter,
  publicProcedure,
} from "@/server/api/trpc";
import { createCategorySchema, deleteCategorySchema, updateCategorySchema } from "schema/category.schema";
import { executePaginatedQuery } from "@/server/utils/pagination";

export const categoryRouter = createTRPCRouter({
  create: adminProcedure
    .input(
      createCategorySchema
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
        limit: z.number().min(1).max(100).default(10),
        page: z.number().min(1).default(1),
        cursor: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const result = await executePaginatedQuery({
        db: ctx.db,
        model: "category",
        input,
        include: {
          _count: {
            select: {
              items: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return {
        categories: result.items,
        nextCursor: result.nextCursor,
        pagination: result.pagination,
      };
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const category = await ctx.db.category.findFirst({
        where: {
          id: input.id,
          deletedAt: null,
        },
        include: {
          _count: {
            select: {
              items: {
                where: {
                  deletedAt: null,
                },
              },
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
      updateCategorySchema,
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      const existingCategory = await ctx.db.category.findFirst({
        where: {
          id,
          createdById: ctx.session.user.id,
          deletedAt: null,
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
    .input(deleteCategorySchema)
    .mutation(async ({ ctx, input }) => {
      const existingCategory = await ctx.db.category.findFirst({
        where: {
          id: input.id,
          createdById: ctx.session.user.id,
          deletedAt: null,
        },
        include: {
          _count: {
            select: {
              items: {
                where: {
                  deletedAt: null,
                },
              },
            },
          },
        },
      });

      if (!existingCategory) {
        throw new Error("Category not found or you don't have permission to delete it");
      }

      // Check if category has active items
      if (existingCategory._count.items > 0) {
        throw new Error("Cannot delete category that has active items. Please move or delete items first.");
      }

      // Soft delete: set deletedAt timestamp
      return ctx.db.category.update({
        where: { id: input.id },
        data: { deletedAt: new Date() },
      });
    }),

  getAllForDropdown: publicProcedure
    .query(async ({ ctx }) => {
      return ctx.db.category.findMany({
        where: {
          deletedAt: null,
        },
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
        },
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
          deletedAt: null,
          name: {
            contains: input.query,
          },
        },
        orderBy: { createdAt: "desc" },
        take: input.limit,
        include: {
          _count: {
            select: {
              items: {
                where: {
                  deletedAt: null,
                },
              },
            },
          },
        },
      });
    }),
});
