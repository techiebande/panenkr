import { createTRPCReact } from "@trpc/react-query";
import { type AppRouter } from "@/lib/trpc/root";

/**
 * This is the tRPC client for your React components.
 * It's fully type-safe and tells your components
 * what procedures are available on the server.
 */
export const trpc = createTRPCReact<AppRouter>({});
