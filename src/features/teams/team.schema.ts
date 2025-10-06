import { z } from "zod";

export const createTeamSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  shortName: z.string().optional().or(z.literal("")),
  leagueId: z.string().cuid().optional().or(z.literal("")),
  crestUrl: z.string().optional().or(z.literal("")),
  externalId: z.string().optional().or(z.literal("")),
});

export const updateTeamSchema = createTeamSchema.extend({
  id: z.string().cuid(),
});

export type CreateTeamInput = z.infer<typeof createTeamSchema>;
export type UpdateTeamInput = z.infer<typeof updateTeamSchema>;
