import type { Item } from "@prisma/client";

type ConditionalFieldModel = {
  text: string;
  value?: number;
  children?: ConditionalFieldModel[];
};

type ItemModel = Item & {
  conditionalFields: ConditionalFieldModel[] | null;
  category: {
    id: string;
    name: string;
  };
}

export type { ItemModel, ConditionalFieldModel };
