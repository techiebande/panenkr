
// src/features/leagues/league.router.ts
import { prisma } from "@/lib/prisma";
import { protectedProcedure, createTRPCRouter, adminProcedure } from "@/lib/trpc/server";
import { z } from "zod";
import slugify from "slugify";
import { createLeagueSchema, updateLeagueSchema } from "./league.schema";

export const leagueRouter = createTRPCRouter({
  list: protectedProcedure.query(async () => {
    return prisma.league.findMany({ orderBy: { name: "asc" } });
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ input }) => {
      return prisma.league.findUnique({ where: { id: input.id } });
    }),

  create: adminProcedure
    .input(createLeagueSchema)
    .mutation(async ({ input }) => {
      const { name, country } = input;
      const slug = slugify(name, { lower: true, strict: true });

      const existing = await prisma.league.findFirst({ where: { OR: [{ name }, { slug }] } });
      if (existing) {
        throw new Error("A league with this name or slug already exists.");
      }

      return prisma.league.create({
        data: {
          name,
          country: country || null,
          slug,
        },
      });
    }),

  update: adminProcedure
    .input(updateLeagueSchema)
    .mutation(async ({ input }) => {
      const { id, name, country } = input;
      const slug = slugify(name, { lower: true, strict: true });
      const conflict = await prisma.league.findFirst({ where: { slug, NOT: { id } } });
      if (conflict) {
        throw new Error("A league with a similar name already exists (slug conflict).");
      }
      return prisma.league.update({
        where: { id },
        data: { name, country: country || null, slug },
      });
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ input }) => {
      return prisma.league.delete({ where: { id: input.id } });
    }),
});
