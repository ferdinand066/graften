import type { Order, OrderItem } from "@prisma/client";

type OrderModel = Order & {
  orderItems?: OrderItem[];
}

export type { OrderModel };
