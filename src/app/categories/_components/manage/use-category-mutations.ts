"use client";

import { api } from "@/trpc/react";
import type { Category } from "@prisma/client";
import { useState } from "react";
import { toast } from "sonner";
import { type CreateCategoryInput } from "schema/category.schema";

export type CategoryWithItems = Category & {
  _count: {
    items: number;
  };
};

export function useCategoryMutations(onUpdateSuccess?: () => void) {
  const [editingCategory, setEditingCategory] = useState<CategoryWithItems | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<{ id: string; name: string } | null>(null);

  const utils = api.useUtils();

  const createCategory = api.category.create.useMutation({
    onSuccess: async () => {
      await utils.category.invalidate();
    },
  });

  const updateCategory = api.category.update.useMutation({
    onSuccess: async () => {
      await utils.category.invalidate();
      setEditingCategory(null);
      onUpdateSuccess?.();
    },
  });

  const deleteCategory = api.category.delete.useMutation({
    onSuccess: async () => {
      await utils.category.invalidate();
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
    },
  });

  const handleSubmit = (data: CreateCategoryInput) => {
    if (editingCategory) {
      const updatePromise = updateCategory.mutateAsync({
        id: editingCategory.id,
        name: data.name,
        description: data.description,
      });

      toast.promise(updatePromise, {
        loading: "Updating category...",
        success: "Category updated successfully!",
        error: (err: Error) => `Failed to update category: ${err.message}`,
      });
    } else {
      const createPromise = createCategory.mutateAsync({
        name: data.name,
        description: data.description,
      });

      toast.promise(createPromise, {
        loading: "Creating category...",
        success: "Category created successfully!",
        error: (err: Error) => `Failed to create category: ${err.message}`,
      });
    }
  };

  const handleEdit = (category: CategoryWithItems) => {
    setEditingCategory(category);
  };

  const handleCancel = () => {
    setEditingCategory(null);
  };

  const handleDelete = (id: string, name: string) => {
    setCategoryToDelete({ id, name });
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (categoryToDelete) {
      const deletePromise = deleteCategory.mutateAsync({ id: categoryToDelete.id });

      toast.promise(deletePromise, {
        loading: `Deleting "${categoryToDelete.name}"...`,
        success: `"${categoryToDelete.name}" deleted successfully!`,
        error: (err: Error) => `Failed to delete "${categoryToDelete.name}": ${err.message}`,
      });
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setCategoryToDelete(null);
  };

  return {
    editingCategory,
    createCategory,
    updateCategory,
    deleteCategory,
    handleSubmit,
    handleEdit,
    handleCancel,
    handleDelete,
    handleConfirmDelete,
    handleCancelDelete,
    deleteDialogOpen,
    categoryToDelete,
    isSubmitting: createCategory.isPending || updateCategory.isPending,
  };
}
