import { adminProcedure, createTRPCRouter, publicProcedure } from "@/lib/trpc/server";
import { prisma } from "@/lib/prisma";
import { TRPCError } from "@trpc/server";
import slugify from "slugify";
import { z } from "zod";
import { PublishStatus } from "@prisma/client";
import { createArticleSchema } from "./article.schema";

const updateArticleSchema = createArticleSchema.extend({
  id: z.cuid(),
});

export const articleRouter = createTRPCRouter({
  // Admin procedures
  create: adminProcedure
    .input(createArticleSchema)
    .mutation(async ({ input, ctx }) => {
      const { title, tags, ...rest } = input;

      const existingArticle = await prisma.article.findFirst({
        where: { title },
      });

      if (existingArticle) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "An article with this title already exists.",
        });
      }

      // Create or connect tags
      const tagConnections = tags ? await Promise.all(
        tags.map(async (tagName) => {
          const slug = slugify(tagName, { lower: true, strict: true });
          
          // Find or create tag
          const tag = await prisma.tag.upsert({
            where: { slug },
            update: {},
            create: {
              name: tagName,
              slug,
            },
          });
          
          return { id: tag.id };
        })
      ) : [];

      const newArticle = await prisma.article.create({
        data: {
          title,
          slug: slugify(title, { lower: true, strict: true }),
          authorId: ctx.session.user.id,
          publishedAt: rest.publishStatus === "PUBLISHED" ? new Date() : null,
          ...rest,
          tags: {
            connect: tagConnections,
          },
        },
        include: {
          author: {
            select: { name: true, email: true },
          },
          featuredImage: true,
          tags: true,
        },
      });

      return newArticle;
    }),

  list: adminProcedure
    .input(
      z.object({
        status: z.nativeEnum(PublishStatus).optional(),
        limit: z.number().min(1).max(100).default(50),
        cursor: z.string().nullish(),
      }).optional()
    )
    .query(async ({ input }) => {
      const limit = input?.limit ?? 50;
      const { cursor, status } = input ?? {};

      const articles = await prisma.article.findMany({
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        where: status ? { publishStatus: status } : undefined,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          author: {
            select: { name: true, email: true },
          },
          featuredImage: true,
          tags: true,
          _count: {
            select: { tags: true },
          },
        },
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (articles.length > limit) {
        const nextItem = articles.pop();
        nextCursor = nextItem!.id;
      }

      return {
        articles,
        nextCursor,
      };
    }),

  getById: adminProcedure
    .input(z.object({ id: z.string() }))
  .query(async ({ input }) => {
      const article = await prisma.article.findUnique({
        where: { id: input.id },
        include: {
          author: {
            select: { name: true, email: true },
          },
          featuredImage: true,
          tags: true,
        },
      });
      
      if (!article) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Article not found",
        });
      }
      
      return article;
    }),

  update: adminProcedure
    .input(updateArticleSchema)
    .mutation(async ({ input }) => {
      const { id, tags, ...data } = input;
      
      const existingArticle = await prisma.article.findUnique({
        where: { id },
        include: { tags: true },
      });

      if (!existingArticle) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Article not found",
        });
      }

      // Handle tags if provided
      let tagConnections;
      if (tags) {
        tagConnections = await Promise.all(
          tags.map(async (tagName) => {
            const slug = slugify(tagName, { lower: true, strict: true });
            
            const tag = await prisma.tag.upsert({
              where: { slug },
              update: {},
              create: {
                name: tagName,
                slug,
              },
            });
            
            return { id: tag.id };
          })
        );
      }

      const updatedArticle = await prisma.article.update({
        where: { id },
        data: {
          ...data,
          slug: slugify(data.title, { lower: true, strict: true }),
          publishedAt: 
            data.publishStatus === "PUBLISHED" && !existingArticle.publishedAt 
              ? new Date() 
              : existingArticle.publishedAt,
          tags: tagConnections ? {
            set: [], // Clear existing connections
            connect: tagConnections, // Add new connections
          } : undefined,
        },
        include: {
          author: {
            select: { name: true, email: true },
          },
          featuredImage: true,
          tags: true,
        },
      });

      return updatedArticle;
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const { id } = input;

      const existingArticle = await prisma.article.findUnique({
        where: { id },
      });

      if (!existingArticle) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Article not found",
        });
      }

      await prisma.article.delete({
        where: { id },
      });

      return { success: true };
    }),

  // Public procedures for frontend
  getPublished: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(10),
        cursor: z.string().nullish(),
        tag: z.string().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const limit = input?.limit ?? 10;
      const { cursor, tag } = input ?? {};

      const articles = await prisma.article.findMany({
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        where: {
          publishStatus: "PUBLISHED",
          ...(tag && {
            tags: {
              some: {
                slug: tag,
              },
            },
          }),
        },
        orderBy: {
          publishedAt: "desc",
        },
        include: {
          author: {
            select: { name: true, image: true },
          },
          featuredImage: true,
          tags: true,
        },
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (articles.length > limit) {
        const nextItem = articles.pop();
        nextCursor = nextItem!.id;
      }

      return {
        articles,
        nextCursor,
      };
    }),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const article = await prisma.article.findUnique({
        where: { 
          slug: input.slug,
          publishStatus: "PUBLISHED",
        },
        include: {
          author: {
            select: { name: true, image: true },
          },
          featuredImage: true,
          tags: true,
        },
      });

      if (!article) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Article not found",
        });
      }

      return article;
    }),

    getRecent: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(10).default(4),
      }).optional()
    )
    .query(async ({ input }) => {
      const limit = input?.limit ?? 4;

      const articles = await prisma.article.findMany({
        where: {
          publishStatus: "PUBLISHED",
        },
        take: limit,
        orderBy: {
          publishedAt: "desc",
        },
        include: {
          author: {
            select: { name: true, image: true },
          },
          featuredImage: true,
        },
      });

      return articles;
    }),

  // Tag management
  getTags: adminProcedure.query(async () => {
    const tags = await prisma.tag.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { articles: true },
        },
      },
    });

    return tags;
  }),
});