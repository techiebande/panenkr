import { leagueRouter } from '@/features/leagues/league.router';
import { teamRouter } from '@/features/teams/team.router';
import { articleRouter } from "@/features/articles/article.router";
import { predictionRouter } from "@/features/predictions/prediction.router";
import { matchRouter } from "@/features/matches/match.router";
import { createTRPCRouter } from "@/lib/trpc/server";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  // We will add feature routers here, e.g., predictions: predictionRouter
  predictions: predictionRouter,
  matches: matchRouter,
  articles: articleRouter,
  teams: teamRouter,
  leagues: leagueRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
