import { keysRouter } from "@/trpc/api/routers/keys";
import { createCallerFactory, createTRPCRouter } from "@/trpc/api/trpc";
import { dashboardRouter } from "@/trpc/api/routers/dashboard";
import { devicesRouter } from "@/trpc/api/routers/devices";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
	keys: keysRouter,
	dashboard:dashboardRouter,
	devices:devicesRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
