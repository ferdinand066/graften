import { z } from "zod";

const baseCategoryObject = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  description: z.string(),
});

export const createCategorySchema = baseCategoryObject

export const updateCategorySchema = baseCategoryObject.extend({
  id: z.string(),
});

export const deleteCategorySchema = z.object({
  id: z.string(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type DeleteCategoryInput = z.infer<typeof deleteCategorySchema>;

export const categoryEmptySchemaValue: CreateCategoryInput = {
  name: "",
  description: "",
}
