import { z } from "zod";
import { PredictionType, PublishStatus } from "@prisma/client";

// Temporary enum definitions until types are fully generated
const PredictionResultEnum = z.enum(["PENDING", "WON", "LOST", "VOID"]);
const MatchStatusEnum = z.enum(["SCHEDULED", "LIVE", "FINISHED", "POSTPONED", "CANCELLED"]);

export const createPredictionSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters long"),
  matchId: z
    .cuid({ message: "Invalid match ID format." })
    .min(1, { message: "required" }),
  type: z.nativeEnum(PredictionType),
  value: z.string().min(1, "Prediction value is required"),
  confidence: z.number().min(1).max(10),
  isPremium: z.boolean(),
  content: z.any(),
  publishStatus: z.nativeEnum(PublishStatus).optional(),
});

export const updatePredictionResultSchema = z.object({
  id: z.cuid(),
  result: PredictionResultEnum,
  resultNote: z.string().optional(),
  actualOutcome: z.string().optional(),
});

export const updateMatchResultSchema = z.object({
  id: z.cuid(),
  scoreHome: z.number().int().min(0).optional(),
  scoreAway: z.number().int().min(0).optional(),
  htScoreHome: z.number().int().min(0).optional(),
  htScoreAway: z.number().int().min(0).optional(),
  status: MatchStatusEnum,
  finishedAt: z.date().optional(),
  minute: z.number().int().min(0).max(120).optional(),
});

export type CreatePredictionInput = z.infer<typeof createPredictionSchema>;
export type UpdatePredictionResultInput = z.infer<typeof updatePredictionResultSchema>;
export type UpdateMatchResultInput = z.infer<typeof updateMatchResultSchema>;
