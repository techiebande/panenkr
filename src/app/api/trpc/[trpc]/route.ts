import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { type NextRequest } from "next/server";
import { ZodError } from "zod";
import { appRouter } from "@/lib/trpc/root";
import { createTRPCContext } from "@/lib/trpc/server";

/**
 * This is the HTTP handler for our tRPC API.
 * It's how the client communicates with the server.
 */
const handler = (req: NextRequest) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => createTRPCContext({ headers: req.headers }),
  });

export { handler as GET, handler as POST };
