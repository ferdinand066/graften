import type { PrismaClient } from "@prisma/client";

export interface PaginationInput {
  limit: number;
  page: number;
  cursor?: string;
}

export interface PaginationResult<T> {
  items: T[];
  nextCursor?: string;
  pagination?: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface PaginatedQueryOptions<T> {
  db: PrismaClient;
  model: keyof PrismaClient;
  input: PaginationInput;
  include?: any;
  orderBy?: any;
  where?: any;
  select?: any;
  includeSoftDeleted?: boolean; // Optional flag to include soft-deleted records
}

export async function executePaginatedQuery<T>(
  options: PaginatedQueryOptions<T>
): Promise<PaginationResult<T>> {
  const { db, model, input, include, orderBy = { createdAt: "desc" }, where, select, includeSoftDeleted = false } = options;
  const dbModel = db[model] as any;

  // Add soft delete filtering to where clause
  const softDeleteFilter = includeSoftDeleted ? {} : { deletedAt: null };
  const combinedWhere = where ? { ...where, ...softDeleteFilter } : softDeleteFilter;

  if (input.cursor) {
    // Cursor-based pagination
    const items = await dbModel.findMany({
      take: input.limit + 1,
      cursor: { id: input.cursor },
      orderBy,
      include,
      where: combinedWhere,
      select,
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
  } else {
    // Offset-based pagination (for page-based navigation)
    const skip = (input.page - 1) * input.limit;

    const [items, totalCount] = await Promise.all([
      dbModel.findMany({
        take: input.limit,
        skip,
        orderBy,
        include,
        where: combinedWhere,
        select,
      }),
      dbModel.count({ where: combinedWhere }),
    ]);

    const totalPages = Math.ceil(totalCount / input.limit);
    const hasNextPage = input.page < totalPages;
    const hasPreviousPage = input.page > 1;

    return {
      items,
      pagination: {
        page: input.page,
        limit: input.limit,
        totalCount,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      },
    };
  }
}
