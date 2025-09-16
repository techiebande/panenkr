
// src/features/teams/team.router.ts
import { protectedProcedure, createTRPCRouter } from "@/lib/trpc/server";
import { prisma } from "@/lib/prisma";

export const teamRouter = createTRPCRouter({
  list: protectedProcedure.query(async () => {
    return prisma.team.findMany({
      orderBy: {
        name: "asc",
      },
    });
  }),
});
