// src/features/matches/match.router.ts
import { createMatchSchema, updateMatchSchema } from "./match.schema";
import { Prisma, MatchStatus } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { protectedProcedure, createTRPCRouter, adminProcedure, publicProcedure } from "@/lib/trpc/server";

// 1. Define a Prisma Validator to include the relations.
// This creates a reusable definition for what a "MatchWithTeams" looks like.
const matchWithTeamsValidator = Prisma.validator<Prisma.MatchDefaultArgs>()({
  include: {
    homeTeam: true,
    awayTeam: true,
    league: true,
  },
});

// 2. Create an exportable type from the validator.
// This is the exact, fully-typed shape of a Match object with its teams included.
export type MatchWithTeams = Prisma.MatchGetPayload<
  typeof matchWithTeamsValidator
>;

export const matchRouter = createTRPCRouter({
  list: protectedProcedure.query(async () => {
    return prisma.match.findMany({
      where: {
        status: {
          in: Object.values(MatchStatus),
        },
      },
      include: {
        homeTeam: true,
        awayTeam: true,
      },
      orderBy: {
        kickoffAt: "desc",
      },
    });
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return prisma.match.findUnique({
        where: { id: input.id },
        include: {
          homeTeam: true,
          awayTeam: true,
          league: true,
        },
      });
    }),
  search: protectedProcedure
    .input(z.object({ query: z.string() }))
    // 3. Tell our tRPC procedure that it explicitly returns an array of our new type.
    .query(async ({ input }): Promise<MatchWithTeams[]> => {
      const queryFilter = input.query ? {
        OR: [
          {
            homeTeam: {
              name: { contains: input.query, mode: "insensitive" },
            },
          },
          {
            awayTeam: {
              name: { contains: input.query, mode: "insensitive" },
            },
          },
        ],
      } : {};

      const matches = await prisma.match.findMany({
        where: {
          ...queryFilter,
          status: {
            in: Object.values(MatchStatus),
          },
        },
        take: 10,
        // The 'include' here matches our validator above.
        include: {
          homeTeam: true,
          awayTeam: true,
          league: true,
        },
        orderBy: {
          kickoffAt: "asc",
        },
      });
      return matches;
    }),
  
  create: adminProcedure
    .input(createMatchSchema)
    .mutation(async ({ input }) => {
      return prisma.match.create({ data: input });
    }),

  update: adminProcedure
    .input(updateMatchSchema)
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return prisma.match.update({
        where: { id },
        data,
      });
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      return prisma.match.delete({ where: { id: input.id } });
    }),

  getPublicById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return prisma.match.findUnique({
        where: { id: input.id },
        include: {
          homeTeam: true,
          awayTeam: true,
          league: true,
        },
      });
    }),
});
