import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
import { auth } from "@/lib/auth";

export const createTRPCContext = async () => {
  const session = await auth();
  return {
    session,
  };
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  // We configure how zod errors are formatted.
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

// This is the router factory. We'll use this to create our main app router.
export const createTRPCRouter = t.router;

/**
 * This is a "public procedure". It's a building block for API endpoints
 * that don't require authentication. Anyone can call these.
 */
export const publicProcedure = t.procedure;

const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      // infers the `session` as non-nullable
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

// Protected procedure for logged-in users
export const protectedProcedure = t.procedure.use(enforceUserIsAuthed);

const enforceUserIsAdminOrEditor = enforceUserIsAuthed.unstable_pipe(
  ({ ctx, next }) => {
    if (
      ctx.session.user.role !== "ADMIN" &&
      ctx.session.user.role !== "EDITOR"
    ) {
      throw new TRPCError({ code: "FORBIDDEN" });
    }

    return next({
      ctx: {
        session: { ...ctx.session, user: ctx.session.user },
      },
    });
  }
);

// Protected procedure for admins/editors
export const adminProcedure = t.procedure.use(enforceUserIsAdminOrEditor);
