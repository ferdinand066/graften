import { z } from "zod";

const conditionalFieldSchema: z.ZodType<{
  text: string;
  value?: number;
  children?: ConditionalFieldModel[];
}> = z.lazy(() =>
  z.object({
    text: z.string(),
    value: z.number().optional(),
    children: z.array(conditionalFieldSchema).optional(),
  })
);

type ConditionalFieldModel = z.infer<typeof conditionalFieldSchema>;

const baseItemObject = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  description: z.string(),
  price: z.number().min(0, "Price must be positive"),

  minimumQuantity: z.number().int().min(0, "Minimum quantity must be non-negative"),
  maximumQuantity: z.number().int().min(0, "Maximum quantity must be non-negative").optional(),
  circulation: z.number().int().min(0, "Circulation must be non-negative"),

  status: z.number().int().min(0, "Status must be non-negative"),
  conditionalFields: z.array(conditionalFieldSchema).nullable(),
  categoryId: z.string().min(1, "Category is required"),
});

const withItemRefinements = (schema: typeof baseItemObject) => {
  return schema
    .refine(
      (data) =>
        data.maximumQuantity === undefined ||
        data.minimumQuantity === undefined ||
        data.maximumQuantity > data.minimumQuantity,
      {
        message: "Maximum quantity must be greater than minimum quantity",
        path: ["maximumQuantity"],
      }
    )
    .refine(
      (data) =>
        data.circulation === undefined ||
        data.minimumQuantity === undefined ||
        data.circulation <= data.minimumQuantity,
      {
        message: "Circulation cannot be higher than minimum quantity",
        path: ["circulation"],
      }
    )
    .refine(
      (data) =>
        data.minimumQuantity % data.circulation === 0,
      {
        message: "Circulation must be a multiple of minimum quantity",
        path: ["circulation"],
      }
    );
};

export const createItemSchema = withItemRefinements(baseItemObject);
export const updateItemSchema = withItemRefinements(baseItemObject.extend({
  id: z.string(),
}));

export type CreateItemInput = z.infer<typeof createItemSchema>;
export type UpdateItemInput = z.infer<typeof updateItemSchema>;
export type { ConditionalFieldModel };

export const itemEmptySchemaValue: CreateItemInput = {
  name: "",
  description: "",
  price: 0,

  minimumQuantity: 1,
  maximumQuantity: undefined,
  circulation: 1,

  status: 1,

  conditionalFields: null,
  categoryId: "",
};
