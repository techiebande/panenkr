import { Suspense } from 'react';
import { appRouter } from '@/lib/trpc/root';
import { createTRPCContext } from '@/lib/trpc/server';
import ArticleCard from '@/features/articles/ArticleCard';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const ARTICLES_PER_PAGE = 12;

async function ArticlesList({ cursor }: { cursor?: string }) {
  const context = await createTRPCContext();
  const caller = appRouter.createCaller(context);
  const { articles } = await caller.articles.getPublished({
    limit: ARTICLES_PER_PAGE,
    cursor,
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
}

function Pagination({ nextCursor, cursor }: { nextCursor?: string | null, cursor?: string }) {
    return (
        <div className="flex justify-center items-center space-x-4 mt-12">
            {cursor && <Button asChild variant="outline"><Link href={"/articles"}>First Page</Link></Button>}
            {nextCursor && (
                <Button asChild variant="outline">
                    <Link href={`/articles?cursor=${nextCursor}`}>Next Page</Link>
                </Button>
            )}
        </div>
    );
}

import { Skeleton } from "@/components/ui/skeleton";

function ListSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 12 }).map((_, i) => (
        <Skeleton key={i} className="h-48 w-full" />
      ))}
    </div>
  );
}

export default async function ArticlesPage({ searchParams }: { searchParams: Promise<{ cursor?: string }> }) {
    const { cursor } = await searchParams;
    const context = await createTRPCContext();
    const caller = appRouter.createCaller(context);
    const { nextCursor } = await caller.articles.getPublished({ limit: ARTICLES_PER_PAGE, cursor });

  return (
<div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-16 sm:py-24">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">Football Articles</h1>
          <p className="mt-4 text-lg text-muted-foreground">Your source for the latest news, analysis, and stories.</p>
        </div>
        <Suspense fallback={<ListSkeleton />}>
          <ArticlesList cursor={cursor} />
        </Suspense>
        <Pagination nextCursor={nextCursor} cursor={cursor} />
      </div>
    </div>
  );
}
