import type { Category } from "@prisma/client";

type CategoryModel = Category & {
  _count: {
    items: number;
  };
}

export type { CategoryModel };
