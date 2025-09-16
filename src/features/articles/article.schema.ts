import { z } from "zod";
import { PublishStatus } from "@prisma/client";

export const createArticleSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters long"),
  content: z.any(), // JSON content from rich text editor
  featuredImageId: z.string().optional(),
  publishStatus: z.nativeEnum(PublishStatus).default("DRAFT"),
  tags: z.array(z.string()).optional(),
});

export type CreateArticleInput = z.infer<typeof createArticleSchema>;