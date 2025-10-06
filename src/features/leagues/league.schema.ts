import { z } from "zod";

export const createLeagueSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  country: z.string().optional().or(z.literal("")),
});

export const updateLeagueSchema = createLeagueSchema.extend({
  id: z.string().cuid(),
});

export type CreateLeagueInput = z.infer<typeof createLeagueSchema>;
export type UpdateLeagueInput = z.infer<typeof updateLeagueSchema>;
