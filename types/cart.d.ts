import type { ConditionalFieldModel } from "./item";

export interface CartItem {
  id: string;
  itemId: string;
  itemName: string;
  itemSlug: string;
  itemPrice: number;
  categoryName: string;
  quantity: number;
  selectedConditionalFields: ConditionalFieldModel[] | null;
  totalPrice: number;
  createdAt: Date;
  minimumQuantity: number;
  maximumQuantity: number | null;
  circulation: number;
}

// Note: SelectedOption is still used in item-detail.tsx for UI state management
export interface SelectedOption {
  fieldIndex: number;
  path: number[];
  selectedItem: ConditionalFieldModel;
  fullPath: ConditionalFieldModel[];
}
