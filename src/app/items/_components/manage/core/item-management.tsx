"use client";

import { CardTable } from "@/app/_components/pages/card-table";
import { PageHeader, PageHeaderAction, PageHeaderContent, PageHeaderDescription, PageHeaderTitle } from "@/app/_components/pages/page-header";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { useState } from "react";
import { ItemCard } from "../item-card";
import { ItemEmptyState } from "../item-empty-state";
import { ItemForm } from "../item-form";
import { DeleteConfirmationDialog } from "../delete-confirmation-dialog";
import { type CreateItemInput } from "schema/item.schema";
import type { ItemModel } from "types/item";
import { DataPagination } from "@/app/_components/pages/data-pagination";
import { useItemMutations } from "./use-item-mutations";

export function ItemManagement() {
  const [isCreating, setIsCreating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: itemsData, isLoading } = api.item.getAll.useQuery({
    limit: itemsPerPage,
    page: currentPage,
  });

  const {
    editingItem,
    deleteItem,
    handleSubmit,
    handleEdit,
    handleCancel,
    handleDelete,
    handleConfirmDelete,
    handleCancelDelete,
    deleteDialogOpen,
    itemToDelete,
    isSubmitting,
  } = useItemMutations(() => setIsCreating(false));

  const items = itemsData?.items ?? [];
  const pagination = itemsData?.pagination;

  const handleFormCancel = () => {
    handleCancel();
    setIsCreating(false);
  };

  const handleEditItem = (item: ItemModel) => {
    handleEdit(item);
    setIsCreating(true);
  };

  const handleFormSubmit = (data: CreateItemInput) => {
    handleSubmit(data);
    if (!editingItem) {
      setIsCreating(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="w-full space-y-6">
      <PageHeader>
        <PageHeaderContent>
          <PageHeaderTitle>Item Management</PageHeaderTitle>
          <PageHeaderDescription>
            Manage your inventory items
          </PageHeaderDescription>
        </PageHeaderContent>

        {
          !isCreating && <PageHeaderAction>
            <Button
              onClick={() => setIsCreating(true)}
              className="px-6 py-3 rounded-lg font-semibold transition-colors shadow-lg"
            >
              Create
            </Button>
          </PageHeaderAction>
        }
      </PageHeader>

      {(isCreating || editingItem) ? (
        <ItemForm
          editingItem={editingItem}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          isSubmitting={isSubmitting}
        />
      ) : (
        <>
          <CardTable
            data={items as ItemModel[]}
            loading={isLoading}
            emptyState={
              <ItemEmptyState setIsCreating={setIsCreating} />
            }
            renderItem={(item) => (
              <ItemCard
                key={item.id}
                item={item}
                isCreating={isCreating}
                handleEdit={handleEditItem}
                handleDelete={handleDelete}
                isDeleting={deleteItem.isPending && itemToDelete?.id === item.id}
              />
            )}
          />

          {pagination && (
            <DataPagination
              pagination={pagination}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}

      <DeleteConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        itemName={itemToDelete?.name ?? ""}
        isDeleting={deleteItem.isPending}
      />
    </div>
  );
}
