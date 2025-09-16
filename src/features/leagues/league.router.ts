
// src/features/leagues/league.router.ts
import { prisma } from "@/lib/prisma";
import { protectedProcedure, createTRPCRouter } from "@/lib/trpc/server";

export const leagueRouter = createTRPCRouter({
  list: protectedProcedure.query(async () => {
    return prisma.league.findMany({
      orderBy: {
        name: "asc",
      },
    });
  }),
});
