"use client";

import { CardTable } from "@/app/_components/pages/card-table";
import { PageHeader, PageHeaderAction, PageHeaderContent, PageHeaderDescription, PageHeaderTitle } from "@/app/_components/pages/page-header";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { useState } from "react";
import type { CreateCategoryInput } from "schema/category.schema";
import type { CategoryModel } from "types/category";
import { CategoryCard } from "../category-card";
import { CategoryEmptyState } from "../category-empty-state";
import { CategoryForm } from "../category-form";
import { DeleteConfirmationDialog } from "../delete-confirmation-dialog";
import { useCategoryMutations } from "./use-category-mutations";
import { DataPagination } from "@/app/_components/pages/data-pagination";

export function CategoryManagement() {
  const [isCreating, setIsCreating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: categoriesData, isLoading } = api.category.getAll.useQuery({
    limit: itemsPerPage,
    page: currentPage,
  });

  const {
    editingCategory,
    deleteCategory,
    handleSubmit,
    handleEdit,
    handleCancel,
    handleDelete,
    handleConfirmDelete,
    handleCancelDelete,
    deleteDialogOpen,
    categoryToDelete,
    isSubmitting,
  } = useCategoryMutations(() => setIsCreating(false));

  const categories = categoriesData?.categories || [];
  const pagination = categoriesData?.pagination;

  const handleFormCancel = () => {
    handleCancel();
    setIsCreating(false);
  };

  const handleEditCategory = (category: CategoryModel) => {
    handleEdit(category);
    setIsCreating(true);
  };

  const handleFormSubmit = (data: CreateCategoryInput) => {
    handleSubmit(data);
    if (!editingCategory) {
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
          <PageHeaderTitle>Category Management</PageHeaderTitle>
          <PageHeaderDescription>
            Organize your items into categories
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

      {(isCreating || editingCategory) ? (
        <CategoryForm
          editingCategory={editingCategory}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          isSubmitting={isSubmitting}
        />
      ) : (
        <>
          <CardTable
            data={categories}
            loading={isLoading}
            emptyState={
              <CategoryEmptyState setIsCreating={setIsCreating} />
            }
            renderItem={(category) => (
              <CategoryCard
                key={category.id}
                category={category}
                isCreating={isCreating}
                handleEdit={handleEditCategory}
                handleDelete={handleDelete}
                isDeleting={deleteCategory.isPending && categoryToDelete?.id === category.id}
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
        categoryName={categoryToDelete?.name || ""}
        isDeleting={deleteCategory.isPending}
      />
    </div>
  );
}
