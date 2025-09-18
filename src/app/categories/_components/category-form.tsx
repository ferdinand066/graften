"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { categoryEmptySchemaValue, createCategorySchema, type CreateCategoryInput } from "schema/category.schema";
import type { CategoryModel } from "types/category";

interface CategoryFormProps {
  editingCategory?: CategoryModel | null;
  onSubmit: (data: CreateCategoryInput) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function CategoryForm({ editingCategory, onSubmit, onCancel, isSubmitting }: CategoryFormProps) {
  const form = useForm<CreateCategoryInput>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: {
      name: editingCategory?.name || categoryEmptySchemaValue.name,
      description: editingCategory?.description || categoryEmptySchemaValue.description,
    },
  });

  const handleSubmit = (data: CreateCategoryInput) => {
    onSubmit(data);
  };

  const handleCancel = () => {
    form.reset(categoryEmptySchemaValue);
    onCancel();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {editingCategory ? "Edit Category" : "Create New Category"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter category name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Optional description"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 rounded-lg font-medium transition-colors"
              >
                {isSubmitting
                  ? "Saving..."
                  : editingCategory
                    ? "Update Category"
                    : "Create Category"}
              </Button>
              <Button
                type="button"
                onClick={handleCancel}
                variant="outline"
                className="px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
