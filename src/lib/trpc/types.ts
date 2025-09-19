import { type appRouter } from "./root";
import { type MatchWithTeams } from "@/features/matches/match.router";
import { JsonValue } from "@prisma/client/runtime/library";

export type AppRouter = typeof appRouter;

// Define PredictionWithMatch type
export type PredictionWithMatch = {
  id: string;
  title: string;
  matchId: string;
  type: string;
  value: string;
  confidence: number;
  isPremium: boolean;
  content: JsonValue;
  match: MatchWithTeams;
};
