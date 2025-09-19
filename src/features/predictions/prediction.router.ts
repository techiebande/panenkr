import { adminProcedure, createTRPCRouter, publicProcedure } from "@/lib/trpc/server";
import { createPredictionSchema, updatePredictionResultSchema, updateMatchResultSchema } from "./prediction.schema";
import { TRPCError } from "@trpc/server";
import slugify from "slugify";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { PublishStatus } from "@prisma/client";
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
      const { title, matchId, summary, teamNewsHome, teamNewsAway, ...rest } = input;
      const slug = slugify(title, { lower: true, strict: true });

      const existingPrediction = await prisma.prediction.findFirst({
        where: {
          OR: [
            { title },
            { slug },
          ],
        },
      });

      if (existingPrediction) {
        if (existingPrediction.title === title) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "A prediction with this title already exists.",
          });
        }
        if (existingPrediction.slug === slug) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "A prediction with a similar title already exists, resulting in a duplicate slug.",
          });
        }
      }

      const newPrediction = await prisma.prediction.create({
        data: {
          title,
          slug,
          matchId,
          summary,
          teamNewsHome,
          teamNewsAway,
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
      const { id, summary, teamNewsHome, teamNewsAway, ...data } = input;
      const updatedPrediction = await prisma.prediction.update({
        where: { id },
        data: {
          ...data,
          summary,
          teamNewsHome,
          teamNewsAway,
          slug: slugify(data.title, { lower: true, strict: true }),
        },
      });

      return updatedPrediction;
    }),

  updateStatus: adminProcedure
    .input(z.object({ id: z.string(), status: z.nativeEnum(PublishStatus) }))
    .mutation(async ({ input }) => {
      const { id, status } = input;

      const updatedPrediction = await prisma.prediction.update({
        where: { id },
        data: {
          publishStatus: status,
          publishedAt: status === "PUBLISHED" ? new Date() : null,
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

    getPublic: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(10),
        page: z.number().min(1).default(1).optional(),
        date: z.enum(["today", "tomorrow", "weekend", "all"]).default("all"),
        type: z.enum(["ALL", "ONE_X_TWO", "OVER_UNDER", "BTTS", "HT_FT", "CUSTOM"]).default("ALL").optional(),
        sort: z.enum(["DATE_DESC", "DATE_ASC", "CONF_DESC", "CONF_ASC"]).default("DATE_DESC").optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const limit = input?.limit ?? 10;
      const page = input?.page ?? 1;
      const skip = (page - 1) * limit;
      const dateFilter = input?.date ?? "all";
      const typeFilter = input?.type ?? "ALL";
      const sort = input?.sort ?? "DATE_DESC";

      let startDate: Date | undefined;
      let endDate: Date | undefined;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (dateFilter === "today") {
        startDate = today;
        endDate = new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1);
      } else if (dateFilter === "tomorrow") {
        startDate = new Date(today.getTime() + 24 * 60 * 60 * 1000);
        endDate = new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000 - 1);
      } else if (dateFilter === "weekend") {
        let daysUntilWeekend = 5 - today.getDay(); // Friday
        if (daysUntilWeekend < 0) {
          daysUntilWeekend += 7;
        }
        startDate = new Date(today.getTime() + daysUntilWeekend * 24 * 60 * 60 * 1000);
        endDate = new Date(startDate.getTime() + 3 * 24 * 60 * 60 * 1000 - 1);
      }

      const baseWhereClause = {
        publishStatus: PublishStatus.PUBLISHED,
        ...(startDate && endDate && { match: { kickoffAt: { gte: startDate, lte: endDate } } }),
      };
      
      const whereClause = typeFilter !== "ALL" 
        ? { ...baseWhereClause, type: typeFilter }
        : baseWhereClause;

      const [freeCount, premiumCount] = await Promise.all([
        prisma.prediction.count({ where: { ...whereClause, isPremium: false } }),
        prisma.prediction.count({ where: { ...whereClause, isPremium: true } }),
      ]);

      const free = await prisma.prediction.findMany({
        where: {
          ...whereClause,
          isPremium: false,
        },
        skip,
        take: limit,
        orderBy:
          sort === "DATE_ASC" ? { publishedAt: "asc" } :
          sort === "CONF_DESC" ? { confidence: "desc" } :
          sort === "CONF_ASC" ? { confidence: "asc" } :
          { publishedAt: "desc" },
        include: {
          author: {
            select: { name: true, image: true },
          },
          match: {
            include: {
              homeTeam: true,
              awayTeam: true,
              league: true,
            },
          },
        },
      });

      const premium = await prisma.prediction.findMany({
        where: {
          ...whereClause,
          isPremium: true,
        },
        skip,
        take: limit,
        orderBy:
          sort === "DATE_ASC" ? { publishedAt: "asc" } :
          sort === "CONF_DESC" ? { confidence: "desc" } :
          sort === "CONF_ASC" ? { confidence: "asc" } :
          { publishedAt: "desc" },
        include: {
          author: {
            select: { name: true, image: true },
          },
          match: {
            include: {
              homeTeam: true,
              awayTeam: true,
              league: true,
            },
          },
        },
      });

      const totalPages = Math.max(
        Math.max(1, Math.ceil(freeCount / limit)),
        Math.max(1, Math.ceil(premiumCount / limit))
      );

      return {
        free,
        premium,
        meta: { page, limit, totalPages, freeCount, premiumCount },
      };
    }),

  getPublicByMatchId: publicProcedure
    .input(z.object({ matchId: z.string() }))
    .query(async ({ input }) => {
      return prisma.prediction.findMany({
        where: {
          matchId: input.matchId,
          publishStatus: PublishStatus.PUBLISHED,
        },
        include: {
          author: {
            select: { name: true, image: true },
          },
          match: {
            include: {
              homeTeam: true,
              awayTeam: true,
              league: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }),

  getPublicBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const prediction = await prisma.prediction.findUnique({
        where: {
          slug: input.slug,
          publishStatus: PublishStatus.PUBLISHED,
        },
        include: {
          author: {
            select: { name: true, image: true },
          },
          match: {
            include: {
              homeTeam: true,
              awayTeam: true,
              league: true,
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

    getHomepagePredictions: publicProcedure.query(async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
  
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
  
      const endOfTomorrow = new Date(tomorrow);
      endOfTomorrow.setHours(23, 59, 59, 999);
  
      const weekendStart = new Date(today);
      let daysUntilWeekend = 5 - today.getDay(); // Friday
      if (daysUntilWeekend < 0) {
        daysUntilWeekend += 7;
      }
      weekendStart.setDate(today.getDate() + daysUntilWeekend);
      weekendStart.setHours(0, 0, 0, 0);
  
      const weekendEnd = new Date(weekendStart);
      weekendEnd.setDate(weekendStart.getDate() + 2);
      weekendEnd.setHours(23, 59, 59, 999);
  
      const fetchPredictions = async (startDate: Date, endDate: Date) => {
        return prisma.prediction.findMany({
          where: {
            publishStatus: 'PUBLISHED',
            match: {
              kickoffAt: {
                gte: startDate,
                lte: endDate,
              },
            },
          },
          take: 10,
          orderBy: {
            match: {
              kickoffAt: 'asc',
            },
          },
          include: {
            author: {
              select: { name: true, image: true },
            },
            match: {
              include: {
                homeTeam: true,
                awayTeam: true,
                league: true,
              },
            },
          },
        });
      };
  
      const [todaysPredictions, tomorrowsPredictions, weekendPredictions] =
        await Promise.all([
          fetchPredictions(today, new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1)),
          fetchPredictions(tomorrow, endOfTomorrow),
          fetchPredictions(weekendStart, weekendEnd),
        ]);
  
      return {
        today: todaysPredictions,
        tomorrow: tomorrowsPredictions,
        weekend: weekendPredictions,
      };
    }),
});



