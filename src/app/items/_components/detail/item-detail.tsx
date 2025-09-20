"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import InputNumber from "@/components/ui/custom/input-number";
import { formatCurrency } from "@/lib/utils";
import { api } from "@/trpc/react";
import {
  AlertCircle,
  Info,
  Minus,
  Plus,
  ShoppingCart
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { ConditionalFieldModel, ItemModel } from "types/item";

interface ItemDetailProps {
  slug: string;
}

export function ItemDetail({ slug }: ItemDetailProps) {
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, any>>({});
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { data: item, isLoading, error } = api.item.getBySlug.useQuery<ItemModel>({ slug });

  // Initialize quantity when item data loads
  useEffect(() => {
    if (item) {
      const typedItem = item as ItemModel;
      const minQuantity = typedItem.minimumQuantity || 1;
      setQuantity(minQuantity);
    }
  }, [item]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const typedItem = item as ItemModel;
  const maxQuantity = typedItem?.maximumQuantity;
  const minQuantity = typedItem?.minimumQuantity || 1;
  const circulation = typedItem?.circulation;

  // Helper function to find the closest valid quantity based on circulation rules
  const findClosestValidQuantity = useCallback((targetQuantity: number): number => {
    if (targetQuantity < minQuantity) return minQuantity;

    if (maxQuantity && targetQuantity > maxQuantity) return maxQuantity;

    // If circulation is 1, any quantity within min/max is valid
    if (circulation <= 1) {
      return Math.max(minQuantity, Math.min(targetQuantity, maxQuantity || targetQuantity));
    }

    // Find the closest valid quantity that follows circulation rules
    // Valid quantities are: minQuantity, minQuantity + circulation, minQuantity + 2*circulation, etc.
    const baseQuantity = Math.floor((targetQuantity - minQuantity) / circulation) * circulation + minQuantity;
    const nextQuantity = baseQuantity + circulation;

    // Choose the closer one, but respect max quantity
    const distanceToBase = Math.abs(targetQuantity - baseQuantity);
    const distanceToNext = Math.abs(targetQuantity - nextQuantity);

    if (distanceToBase <= distanceToNext) {
      return Math.max(minQuantity, Math.min(baseQuantity, maxQuantity || baseQuantity));
    } else {
      const validNext = Math.max(minQuantity, Math.min(nextQuantity, maxQuantity || nextQuantity));
      return maxQuantity && validNext > maxQuantity ? baseQuantity : validNext;
    }
  }, [minQuantity, maxQuantity, circulation]);

  // Debounced validation function
  const debouncedValidateQuantity = useCallback((value: number) => {
    const validQuantity = findClosestValidQuantity(value);
    if (validQuantity !== value) {
      setQuantity(validQuantity);
    }
  }, [findClosestValidQuantity]);

  const handleQuantityChange = (newQuantity: number | undefined) => {
    if (newQuantity === undefined) return;

    // Update quantity immediately for display purposes
    setQuantity(newQuantity);

    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Set new timeout for debounced validation (500ms)
    debounceTimeoutRef.current = setTimeout(() => {
      debouncedValidateQuantity(newQuantity);
    }, 500);
  };

  const handleQuantityBlur = () => {
    // Clear debounce timeout and validate immediately on blur
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    debouncedValidateQuantity(quantity);
  };

  const incrementQuantity = () => {
    const newQuantity = quantity + circulation;

    // Check if increment would exceed maximum
    if (maxQuantity && newQuantity > maxQuantity) {
      return;
    }

    setQuantity(newQuantity);
  };

  const decrementQuantity = () => {
    const newQuantity = quantity - circulation;

    if (newQuantity >= minQuantity) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    // Here you would typically call an API to add to cart
    // For now, we'll just show a toast
    const selectedOptionsText = Object.values(selectedOptions)
      .map(selection => {
        if (selection && typeof selection === 'object' && 'fullPath' in selection) {
          const fullPath = selection.fullPath;
          if (fullPath && fullPath.length > 0) {
            return fullPath.map((item: ConditionalFieldModel) => item.text).join(' → ');
          }
        }
        return null;
      })
      .filter(Boolean)
      .join(', ');

    const toastTitle = `Added ${quantity} × ${typedItem.name} to cart!`;
    const toastDescription = selectedOptionsText
      ? `Options: ${selectedOptionsText}\nTotal: ${formatCurrency(totalPrice)}`
      : `Total: ${formatCurrency(totalPrice)}`;

    toast.success(toastTitle, {
      description: toastDescription,
    });
  };

  const renderConditionalFields = (fields: ConditionalFieldModel[] | null) => {
    if (!fields || fields.length === 0) return null;

    const handleFieldSelection = (fieldIndex: number, path: number[]) => {
      setSelectedOptions(prev => {
        const newOptions = { ...prev };
        const fieldKey = `field-${fieldIndex}`;

        // Navigate to the selected item using the path
        let current = fields[fieldIndex];
        let selectedItem = current;

        for (const pathIndex of path) {
          if (current?.children && current.children[pathIndex]) {
            current = current.children[pathIndex];
            selectedItem = current;
          }
        }

        if (selectedItem) {
          newOptions[fieldKey] = {
            fieldIndex: fieldIndex,
            path: path,
            selectedItem: selectedItem,
            fullPath: [fields[fieldIndex], ...path.reduce((acc, pathIndex, i) => {
              const parent = i === 0 ? fields[fieldIndex] : acc[i - 1];
              if (parent?.children && parent.children[pathIndex]) {
                acc.push(parent.children[pathIndex]);
              }
              return acc;
            }, [] as ConditionalFieldModel[])]
          };
        }

        return newOptions;
      });
    };

    const renderFieldHierarchy = (field: ConditionalFieldModel, fieldIndex: number) => {
      const fieldKey = `field-${fieldIndex}`;
      const selection = selectedOptions[fieldKey];

      // Find current level to display based on selection
      let currentField = field;
      let currentPath: number[] = [];
      let breadcrumb: ConditionalFieldModel[] = [field];

      if (selection && selection.path.length > 0) {
        // If the selected item has children, navigate to it to show its children
        // Otherwise, stay at the current level
        const selectedItem = selection.selectedItem;
        if (selectedItem && selectedItem.children && selectedItem.children.length > 0) {
          // Navigate to the selected item to show its children
          for (let i = 0; i < selection.path.length; i++) {
            const pathIndex = selection.path[i];
            if (currentField.children && currentField.children[pathIndex]) {
              currentField = currentField.children[pathIndex];
              currentPath.push(pathIndex);
              breadcrumb.push(currentField);
            }
          }
        }
      }

      const hasChildren = currentField.children && currentField.children.length > 0;

      return (
        <div key={fieldIndex} className="space-y-3 p-4 border rounded-lg bg-gray-50">
          {/* Breadcrumb navigation */}
          {breadcrumb.length > 1 && (
            <div className="text-sm text-gray-600 mb-3">
              {breadcrumb.map((item, index) => (
                <span key={index}>
                  {index > 0 && ' → '}
                  {item.text}
                </span>
              ))}
            </div>
          )}

          <h4 className="font-medium text-gray-900 mb-3">{currentField.text}</h4>

          <div className="space-y-2">
            {/* Show direct selection if current field has value */}
            {currentField.value !== undefined && (
              <label className="flex items-center space-x-3 p-3 border rounded-md bg-white hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name={`field-${fieldIndex}`}
                  checked={selection && JSON.stringify(selection.path) === JSON.stringify(currentPath)}
                  onChange={() => handleFieldSelection(fieldIndex, currentPath)}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                />
                <div className="flex-1 flex justify-between items-center">
                  <span>{currentField.text}</span>
                  <span className="text-sm text-gray-600">
                    +${formatCurrency(currentField.value)}
                  </span>
                </div>
              </label>
            )}

            {/* Show child options */}
            {hasChildren && currentField.children!.map((child, childIndex) => {
              const childPath = [...currentPath, childIndex];
              const isChildSelected = selection &&
                JSON.stringify(selection.path) === JSON.stringify(childPath);
              const childHasValue = child.value !== undefined;
              const childHasChildren = child.children && child.children.length > 0;

              return (
                <label
                  key={childIndex}
                  className="flex items-center space-x-3 p-3 border rounded-md bg-white hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="radio"
                    name={`field-${fieldIndex}`}
                    checked={isChildSelected}
                    onChange={() => handleFieldSelection(fieldIndex, childPath)}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                  />
                  <div className="flex-1 flex justify-between items-center">
                    <span>
                      {child.text}
                      {!childHasValue && childHasChildren && ' →'}
                    </span>
                    {childHasValue && (
                      <span className="text-sm text-gray-600">
                        +${formatCurrency(child.value!)}
                      </span>
                    )}
                  </div>
                </label>
              );
            })}
          </div>

          {/* Show selection summary */}
          {selection && selection.selectedItem.value !== undefined && (
            <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded text-sm">
              <span className="text-green-800 font-medium">Selected: </span>
              <span className="text-green-700">
                {selection.fullPath.map((item: ConditionalFieldModel) => item.text).join(' → ')}
                <span className="ml-2">+${formatCurrency(selection.selectedItem.value)}</span>
              </span>
            </div>
          )}
        </div>
      );
    };

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Product Options</h3>
        <div className="space-y-4">
          {fields.map((field, index) => renderFieldHierarchy(field, index))}
        </div>
      </div>
    );
  };

  // Calculate total price including conditional field values
  const calculateTotalPrice = useCallback(() => {
    const basePrice = typedItem?.price || 0;
    let optionsPrice = 0;

    // Add prices from selected conditional field options
    Object.values(selectedOptions).forEach(selection => {
      if (selection && typeof selection === 'object' && 'selectedItem' in selection) {
        const selectedItem = selection.selectedItem;
        if (selectedItem && typeof selectedItem.value === 'number') {
          optionsPrice += selectedItem.value;
        }
      }
    });

    return (basePrice + optionsPrice) * quantity;
  }, [typedItem?.price, selectedOptions, quantity]);

  const totalPrice = calculateTotalPrice();


  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gray-200 rounded-lg h-96"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="p-8 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Item Not Found</h2>
          <p className="text-gray-600">The item you're looking for doesn't exist or has been removed.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Image/Placeholder */}
        <div className="space-y-4">
          <Card className="overflow-hidden">
            <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">

            <img
              src={`https://api.dicebear.com/9.x/glass/svg?seed=${item.name}`}
              alt={item.name}
              className="rounded-md w-full h-full"
            />
            </div>
          </Card>
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">{typedItem.category.name}</Badge>
            </div>
            <h1 className="text-3xl font-bold">{typedItem.name}</h1>
            {typedItem.description && (
              <p className="text-gray-600">{typedItem.description}</p>
            )}
          </div>

          {/* Price */}
          <div className="space-y-1">
            <div className="text-3xl font-bold text-primary">
              {typedItem.price ? `$${formatCurrency(typedItem.price)}` : 'Price not set'}
            </div>

            {/* Show options pricing if any options are selected */}
            {Object.keys(selectedOptions).length > 0 && (
              <div className="text-sm text-gray-600 space-y-1">
                {Object.entries(selectedOptions).map(([key, selection]) => {
                  if (selection && typeof selection === 'object' && 'selectedItem' in selection && 'fullPath' in selection) {
                    const selectedItem = selection.selectedItem;
                    const fullPath = selection.fullPath;
                    if (selectedItem && selectedItem.value !== undefined) {
                      return (
                        <div key={key} className="flex justify-between">
                          <span>+ {fullPath.map((item: ConditionalFieldModel) => item.text).join(' → ')}</span>
                          <span>+${formatCurrency(selectedItem.value)}</span>
                        </div>
                      );
                    }
                  }
                  return null;
                })}
              </div>
            )}

            {/* Show total price if options are selected or quantity > 1 */}
            {(Object.keys(selectedOptions).length > 0 || quantity > 1) && (
              <div className="text-lg font-semibold text-gray-900 pt-1 border-t">
                Total: ${formatCurrency(totalPrice)}
              </div>
            )}
          </div>

          {/* Quantity Constraints */}
          <div className="space-y-2">
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <Info className="h-4 w-4" />
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                <span>Min Quantity: {minQuantity}</span>
                {maxQuantity && (
                  <span>Max Quantity: {maxQuantity}</span>
                )}
                {circulation > 1 && (
                  <span>Circulation: Every {circulation} items</span>
                )}
              </div>
            </div>
          </div>

          {/* Conditional Fields */}
          {renderConditionalFields(typedItem.conditionalFields)}

          {/* Quantity Selector */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Quantity</label>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={decrementQuantity}
                  disabled={quantity - circulation < minQuantity}
                  className="h-10 w-10 p-0"
                >
                  <Minus className="h-4 w-4" />
                </Button>

                <div className="w-24">
                  <InputNumber
                    value={quantity}
                    onChange={handleQuantityChange}
                    max={maxQuantity || undefined}
                    allowDecimals={false}
                    className="text-center"
                    onBlur={handleQuantityBlur}
                  />
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={incrementQuantity}
                  disabled={maxQuantity ? quantity + circulation > maxQuantity : false}
                  className="h-10 w-10 p-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Add to Cart Button */}
          <div className="space-y-4">
            <Button
              onClick={handleAddToCart}
              disabled={!typedItem.price}
              className="w-full h-12 text-lg"
              size="lg"
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              {!typedItem.price
                ? 'Price not available'
                : `Add to Cart - $${formatCurrency(totalPrice)}`
              }
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
