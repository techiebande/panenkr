import { adminProcedure, createTRPCRouter, publicProcedure } from "@/lib/trpc/server";
import { createPredictionSchema, updatePredictionResultSchema, updateMatchResultSchema } from "./prediction.schema";
import { TRPCError } from "@trpc/server";
import slugify from "slugify";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
// Using type assertions for enums until fully generated
type PredictionResult = "PENDING" | "WON" | "LOST" | "VOID";
type MatchStatus = "SCHEDULED" | "LIVE" | "FINISHED" | "POSTPONED" | "CANCELLED";

const updatePredictionSchema = createPredictionSchema.extend({
  id: z.cuid(),
});

export const predictionRouter = createTRPCRouter({
  create: adminProcedure
    .input(createPredictionSchema)
    .mutation(async ({ input, ctx }) => {
      const { title, matchId, ...rest } = input;

      const existingPrediction = await prisma.prediction.findFirst({
        where: { title },
      });

      if (existingPrediction) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A prediction with this title already exists.",
        });
      }

      const newPrediction = await prisma.prediction.create({
        data: {
          title,
          slug: slugify(title, { lower: true, strict: true }),
          matchId,
          authorId: ctx.session.user.id,
          ...rest,
        },
      });

      return newPrediction;
    }),

  list: adminProcedure.query(async () => {
    const predictions = await prisma.prediction.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        author: {
          select: { name: true },
        },
        match: {
          include: {
            homeTeam: true,
            awayTeam: true,
          },
        },
      },
    });

    return predictions;
  }),

  getById: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const prediction = await prisma.prediction.findUnique({
        where: { id: input.id },
        include: {
          match: {
            include: {
              homeTeam: true,
              awayTeam: true,
            },
          },
        },
      });
      if (!prediction) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Prediction not found",
        });
      }
      return prediction;
    }),

  update: adminProcedure
    .input(updatePredictionSchema)
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;
      const updatedPrediction = await prisma.prediction.update({
        where: { id },
        data: {
          ...data,
          slug: slugify(data.title, { lower: true, strict: true }),
        },
      });

      return updatedPrediction;
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const { id } = input;

      await prisma.prediction.delete({
        where: { id },
      });

      return { success: true };
    }),

  // Update match results
  updateMatchResult: adminProcedure
    .input(updateMatchResultSchema)
    .mutation(async ({ input }) => {
      const { id, ...data } = input;

      const match = await prisma.match.findUnique({
        where: { id },
      });

      if (!match) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Match not found",
        });
      }

      const updatedMatch = await prisma.match.update({
        where: { id },
        data: {
          ...data,
          status: data.status as MatchStatus,
          finishedAt: data.status === "FINISHED" ? data.finishedAt || new Date() : data.finishedAt,
        },
      });

      return updatedMatch;
    }),

  // Update prediction result
  updatePredictionResult: adminProcedure
    .input(updatePredictionResultSchema)
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;

      const prediction = await prisma.prediction.findUnique({
        where: { id },
        include: { match: true },
      });

      if (!prediction) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Prediction not found",
        });
      }

      const updatedPrediction = await prisma.prediction.update({
        where: { id },
        data: {
          ...data,
          evaluatedAt: new Date(),
          evaluatedBy: ctx.session.user.id,
        },
      });

      return updatedPrediction;
    }),

  // Get predictions that need evaluation (finished matches but pending results)
  getPendingEvaluations: adminProcedure.query(async () => {
      const predictions = await prisma.prediction.findMany({
        where: {
          result: "PENDING" as PredictionResult,
          match: {
            status: "FINISHED" as MatchStatus,
          },
        },
      include: {
        author: {
          select: { name: true, email: true },
        },
        match: {
          include: {
            homeTeam: true,
            awayTeam: true,
          },
        },
      },
      orderBy: {
        match: {
          finishedAt: "desc",
        },
      },
    });

    return predictions;
  }),

  // Get prediction statistics for an author
  getAuthorStats: publicProcedure
    .input(z.object({ authorId: z.string() }))
    .query(async ({ input }) => {
      const { authorId } = input;

      const stats = await prisma.prediction.groupBy({
        by: ['result'],
        where: {
          authorId,
          result: { not: "PENDING" as PredictionResult },
        },
        _count: {
          result: true,
        },
      });

      const total = stats.reduce((sum, stat) => sum + stat._count.result, 0);
      const won = stats.find(s => s.result === "WON")?._count.result || 0;
      const lost = stats.find(s => s.result === "LOST")?._count.result || 0;
      const voided = stats.find(s => s.result === "VOID")?._count.result || 0;

      const accuracy = total > 0 ? Math.round((won / (won + lost)) * 100) : 0;

      return {
        total,
        won,
        lost,
        voided,
        accuracy,
        pending: await prisma.prediction.count({
          where: {
            authorId,
            result: "PENDING" as PredictionResult,
          },
        }),
      };
    }),
});
