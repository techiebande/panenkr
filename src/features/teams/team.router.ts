
// src/features/teams/team.router.ts
import { prisma } from "@/lib/prisma";
import { protectedProcedure, createTRPCRouter } from "@/lib/trpc/server";

export const teamRouter = createTRPCRouter({
  list: protectedProcedure.query(async () => {
    return prisma.team.findMany({
      orderBy: {
        name: "asc",
      },
    });
  }),
});
