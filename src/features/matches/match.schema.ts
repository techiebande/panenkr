
// src/features/matches/match.schema.ts
import { MatchStatus } from "@prisma/client";
import { z } from "zod";

export const createMatchSchema = z.object({
  homeTeamId: z.string().min(1, "Home team is required."),
  awayTeamId: z.string().min(1, "Away team is required."),
  leagueId: z.string().optional(),
  kickoffAt: z.date(),
  status: z.nativeEnum(MatchStatus).default(MatchStatus.SCHEDULED),
  scoreHome: z.number().int().optional(),
  scoreAway: z.number().int().optional(),
});

export const updateMatchSchema = createMatchSchema.extend({
  id: z.string(),
});
