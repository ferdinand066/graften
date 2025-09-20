"use client";

import { DataPagination, type PaginationData } from "@/app/_components/pages/data-pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/utils";
import { api } from "@/trpc/react";
import { EllipsisIcon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState, useEffect, useCallback } from "react";
import type { CategoryModel } from "types/category";
import type { ItemModel } from "types/item";

export function ItemPreview() {
  const router = useRouter();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isTabsScrollable, setIsTabsScrollable] = useState(false);
  const itemsPerPage = 10;
  const tabsRef = useRef<HTMLDivElement>(null);

  // Fetch categories with item counts
  const { data: categoriesData, isLoading: categoriesLoading } = api.category.getAllForDropdown.useQuery({
    showTotalItem: true,
  });

  // Fetch all items (no pagination needed for filtering)
  const { data: itemsData, isLoading: itemsLoading } = api.item.getAllForPreview.useQuery();

  // Filter items by selected category
  const filteredItems = (itemsData as ItemModel[] | undefined)?.filter(item =>
    selectedCategoryId ? item.category.id === selectedCategoryId : true
  ) ?? [];

  const categories = (categoriesData as CategoryModel[] | undefined) ?? [];
  const allItemsCount = itemsData?.length ?? 0;

  // Check if tabs container is scrollable
  const checkScrollability = useCallback(() => {
    if (tabsRef.current) {
      const scrollContainer = tabsRef.current.querySelector('.overflow-x-auto');
      if (scrollContainer) {
        const isScrollable = scrollContainer.scrollWidth > scrollContainer.clientWidth;
        setIsTabsScrollable(isScrollable);
      }
    }
  }, []);

  // Check scrollability when categories data changes or component mounts
  useEffect(() => {
    if (!categoriesLoading) {
      // Use setTimeout to ensure DOM is updated after categories render
      const timeoutId = setTimeout(checkScrollability, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [categoriesData, categoriesLoading, checkScrollability]);

  // Add resize observer to check scrollability on window resize
  useEffect(() => {
    const handleResize = () => {
      checkScrollability();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [checkScrollability]);

  // Pagination logic
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = filteredItems.slice(startIndex, endIndex);

  // Create pagination data for DataPagination component
  const paginationData: PaginationData = {
    page: currentPage,
    limit: itemsPerPage,
    totalCount: filteredItems.length,
    totalPages: totalPages,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
  };

  // Reset to first page when category changes
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setCurrentPage(1);
    // Scroll to the selected category after a short delay to ensure state is updated
    setTimeout(() => scrollToCategory(categoryId), 100);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle dropdown category selection
  const handleDropdownCategoryChange = (categoryId: string) => {
    handleCategoryChange(categoryId);
    setDropdownOpen(false);
  };

  // Scroll to selected category when changed
  const scrollToCategory = (categoryId: string) => {
    if (tabsRef.current) {
      const tabElement = tabsRef.current.querySelector(`[data-value="${categoryId}"]`);
      if (tabElement) {
        // Get the scrollable container (the div with overflow-x-auto)
        const scrollContainer = tabsRef.current.querySelector('.overflow-x-auto');
        if (scrollContainer) {
          const containerRect = scrollContainer.getBoundingClientRect();
          const elementRect = tabElement.getBoundingClientRect();

          // Calculate the position to center the element
          const containerCenter = containerRect.width / 2;
          const elementCenter = elementRect.left - containerRect.left + elementRect.width / 2;
          const scrollOffset = elementCenter - containerCenter;

          // Scroll to center the selected tab
          scrollContainer.scrollBy({
            left: scrollOffset,
            behavior: 'smooth'
          });
        } else {
          // Fallback to original scrollIntoView
          tabElement.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'center'
          });
        }
      }
    }
  };

  const handleItemSelect = (item: ItemModel) => {
    router.push(`/items/${item.slug}`);
  };


  if (categoriesLoading || itemsLoading) {
    return (
      <div className="space-y-4">
        <div className="h-12 bg-secondary/50 rounded-lg animate-pulse" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 bg-secondary/30 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Category Tabs with Dropdown Button */}
      <Tabs value={selectedCategoryId} onValueChange={handleCategoryChange}>
        {/* Integrated tabs with dropdown */}
        <div className="flex-1 overflow-hidden">
          <div
            ref={tabsRef}
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <TabsList className="flex flex-row w-full">
              <div
                className="inline-flex gap-1 p-1 flex-1 overflow-x-auto scrollbar-hide"
                onScroll={checkScrollability}
              >
                <TabsTrigger
                  value=""
                  data-value=""
                  className="flex flex-row gap-1 py-2 px-3 flex-nowrap"
                >
                  <span className="text-sm font-medium">All Items</span>
                  <Badge variant="secondary" className="text-xs h-5">
                    {allItemsCount}
                  </Badge>
                </TabsTrigger>
                {categories.map((category) => (
                  <TabsTrigger
                    key={category.id}
                    value={category.id}
                    data-value={category.id}
                    className="flex flex-row gap-1 py-2 px-3 flex-nowrap"
                  >
                    <span className="text-sm font-medium truncate">{category.name}</span>
                    <Badge variant="secondary" className="text-xs h-5">
                      {category._count.items}
                    </Badge>
                  </TabsTrigger>
                ))}
              </div>
              {isTabsScrollable && (
                <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost">
                      <EllipsisIcon className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Select Category</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuRadioGroup
                      value={selectedCategoryId}
                      onValueChange={handleDropdownCategoryChange}
                    >
                      <DropdownMenuRadioItem value="">
                        <div className="flex items-center justify-between w-full">
                          <span>All Items</span>
                          <Badge variant="secondary" className="text-xs h-5">
                            {allItemsCount}
                          </Badge>
                        </div>
                      </DropdownMenuRadioItem>
                      {categories.map((category) => (
                        <DropdownMenuRadioItem key={category.id} value={category.id}>
                          <div className="flex items-center justify-between w-full">
                            <span className="truncate">{category.name}</span>
                            <Badge variant="secondary" className="text-xs h-5 ml-2">
                              {category._count.items}
                            </Badge>
                          </div>
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </TabsList>
          </div>

        </div>

        {/* Items List */}
        <TabsContent value={selectedCategoryId}>
          {filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-secondary/50 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                {selectedCategoryId ? "No items in this category" : "No items available"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {selectedCategoryId
                  ? "There are no items in the selected category."
                  : "No items have been created yet."
                }
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {paginatedItems.map((item) => (
                  <Card
                    key={item.id}
                    className="cursor-pointer transition-all hover:shadow-md hover:scale-[1.02]"
                    onClick={() => handleItemSelect(item)}
                  >
                    <CardContent className="p-4 flex flex-row gap-4">
                      <Image
                        src={`https://api.dicebear.com/9.x/glass/svg?seed=${item.name}`}
                        alt={item.name}
                        width={100}
                        height={100}
                        className="rounded-md"
                        unoptimized={true}
                      />
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <h3 className="font-semibold text-card-foreground line-clamp-2">
                            {item.name}
                          </h3>
                        </div>

                        {item.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {item.description}
                          </p>
                        )}

                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="text-xs">
                            {item.category.name}
                          </Badge>
                          {item.price && (
                            <Badge variant="secondary" className="text-xs">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                              </svg>
                              {formatCurrency(item.price)}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="mt-8">
                <DataPagination
                  pagination={paginationData}
                  onPageChange={handlePageChange}
                />
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
