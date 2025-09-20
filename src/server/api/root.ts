import { itemRouter } from "@/server/api/routers/item";
import { categoryRouter } from "@/server/api/routers/category";
import { cartRouter } from "@/server/api/routers/cart";
import { orderRouter } from "@/server/api/routers/order";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  item: itemRouter,
  category: categoryRouter,
  cart: cartRouter,
  order: orderRouter,
});

export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
