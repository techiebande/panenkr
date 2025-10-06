
// src/features/teams/team.router.ts
import { prisma } from "@/lib/prisma";
import { protectedProcedure, createTRPCRouter, adminProcedure } from "@/lib/trpc/server";
import { z } from "zod";
import fs from "fs";
import path from "path";
import slugify from "slugify";
import { createTeamSchema, updateTeamSchema } from "./team.schema";

// Simple in-memory cache for crest listing to avoid repeated fs hits
let crestCache: { ts: number; options: { value: string; label: string; filename: string }[] } | null = null;
const CREST_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function formatLabelFromFilename(filename: string) {
  const base = filename.replace(/\.[a-zA-Z0-9]+$/, "");
  // Collapse duplicated halves like "fc-bayern-m-unchenfc-bayern-m-nchen"
  const half = Math.floor(base.length / 2);
  const first = base.slice(0, half);
  const second = base.slice(half);
  const dedup = second.startsWith(first) ? first : base;
  return dedup
    .split(/[-_]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

async function readCrestsDir(): Promise<{ value: string; label: string; filename: string }[]> {
  const now = Date.now();
  if (crestCache && now - crestCache.ts < CREST_CACHE_TTL_MS) {
    return crestCache.options;
  }
  const crestDir = path.resolve(process.cwd(), "public", "crests");
  let files: string[] = [];
  try {
    files = fs
      .readdirSync(crestDir, { withFileTypes: true })
      .filter((d) => d.isFile())
      .map((d) => d.name)
      .filter((name) => /\.(svg|png|jpg|jpeg)$/i.test(name));
      } catch {
    files = [];
  }
  const options = files.map((filename) => ({
    value: `/crests/${filename}`,
    filename,
    label: formatLabelFromFilename(filename),
  }));
  crestCache = { ts: now, options };
  return options;
}

export const teamRouter = createTRPCRouter({
  list: protectedProcedure.query(async () => {
    return prisma.team.findMany({
      orderBy: { name: "asc" },
      include: { league: true },
    });
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ input }) => {
      return prisma.team.findUnique({ where: { id: input.id }, include: { league: true } });
    }),

  create: adminProcedure
    .input(createTeamSchema)
    .mutation(async ({ input }) => {
      const { name, shortName, leagueId, crestUrl, externalId } = input;
      const slug = slugify(name, { lower: true, strict: true });

      const existingByName = await prisma.team.findFirst({ where: { OR: [{ name }, { slug }] } });
      if (existingByName) {
        throw new Error("A team with this name or slug already exists.");
      }

      return prisma.team.create({
        data: {
          name,
          shortName: shortName || null,
          slug,
          crestUrl: crestUrl || null,
          externalId: externalId || null,
          leagueId: leagueId || null,
        },
      });
    }),

  update: adminProcedure
    .input(updateTeamSchema)
    .mutation(async ({ input }) => {
      const { id, name, shortName, leagueId, crestUrl, externalId } = input;
      const slug = slugify(name, { lower: true, strict: true });

      // Ensure slug uniqueness (except current)
      const conflict = await prisma.team.findFirst({ where: { slug, NOT: { id } } });
      if (conflict) {
        throw new Error("A team with a similar name already exists (slug conflict).");
      }

      return prisma.team.update({
        where: { id },
        data: {
          name,
          shortName: shortName || null,
          slug,
          crestUrl: crestUrl || null,
          externalId: externalId || null,
          leagueId: leagueId || null,
        },
      });
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ input }) => {
      return prisma.team.delete({ where: { id: input.id } });
    }),

  listCrests: protectedProcedure
    .input(z.object({ q: z.string().optional() }).optional())
    .query(async ({ input }) => {
      const all = await readCrestsDir();
      const q = input?.q?.trim().toLowerCase();
      if (!q) return all;
      return all.filter((o) =>
        o.label.toLowerCase().includes(q) || o.filename.toLowerCase().includes(q)
      );
    }),

  updateCrest: adminProcedure
    .input(z.object({ teamId: z.string(), crestUrl: z.string().regex(/^\/crests\//) }))
    .mutation(async ({ input }) => {
      const { teamId, crestUrl } = input;
      return prisma.team.update({
        where: { id: teamId },
        data: { crestUrl },
      });
    }),
});
