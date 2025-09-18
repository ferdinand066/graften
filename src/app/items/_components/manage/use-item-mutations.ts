"use client";

import { api } from "@/trpc/react";
import type { Item } from "@prisma/client";
import { useState } from "react";
import { toast } from "sonner";
import { type CreateItemInput } from "schema/item.schema";
import type { ItemModel } from "types/item";

export function useItemMutations(onUpdateSuccess?: () => void) {
  const [editingItem, setEditingItem] = useState<ItemModel | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string } | null>(null);

  const utils = api.useUtils();

  const createItem = api.item.create.useMutation({
    onSuccess: async () => {
      await utils.item.invalidate();
    },
  });

  const updateItem = api.item.update.useMutation({
    onSuccess: async () => {
      await utils.item.invalidate();
      setEditingItem(null);
      onUpdateSuccess?.();
    },
  });

  const deleteItem = api.item.delete.useMutation({
    onSuccess: async () => {
      await utils.item.invalidate();
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    },
  });

  const handleSubmit = (data: CreateItemInput) => {
    if (editingItem) {
      const updatePromise = updateItem.mutateAsync({
        id: editingItem.id,
        name: data.name,
        description: data.description || undefined,
        price: data.price,
        minimumQuantity: data.minimumQuantity,
        maximumQuantity: data.maximumQuantity,
        circulation: data.circulation,
        status: data.status,
        conditionalFields: data.conditionalFields,
      });

      toast.promise(updatePromise, {
        loading: "Updating item...",
        success: "Item updated successfully!",
        error: (err) => `Failed to update item: ${err.message}`,
      });
    } else {
      const createPromise = createItem.mutateAsync({
        name: data.name,
        description: data.description || undefined,
        price: data.price,
        minimumQuantity: data.minimumQuantity,
        maximumQuantity: data.maximumQuantity,
        circulation: data.circulation,
        status: data.status,
        conditionalFields: data.conditionalFields,
        categoryId: data.categoryId,
      });

      toast.promise(createPromise, {
        loading: "Creating item...",
        success: "Item created successfully!",
        error: (err) => `Failed to create item: ${err.message}`,
      });
    }
  };

  const handleEdit = (item: ItemModel) => {
    setEditingItem(item);
  };

  const handleCancel = () => {
    setEditingItem(null);
  };

  const handleDelete = (id: string, name: string) => {
    setItemToDelete({ id, name });
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      const deletePromise = deleteItem.mutateAsync({ id: itemToDelete.id });

      toast.promise(deletePromise, {
        loading: `Deleting "${itemToDelete.name}"...`,
        success: `"${itemToDelete.name}" deleted successfully!`,
        error: (err) => `Failed to delete "${itemToDelete.name}": ${err.message}`,
      });
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  return {
    editingItem,
    createItem,
    updateItem,
    deleteItem,
    handleSubmit,
    handleEdit,
    handleCancel,
    handleDelete,
    handleConfirmDelete,
    handleCancelDelete,
    deleteDialogOpen,
    itemToDelete,
    isSubmitting: createItem.isPending || updateItem.isPending,
  };
}
