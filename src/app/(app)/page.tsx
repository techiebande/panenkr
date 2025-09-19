import { Suspense } from 'react';
import Link from 'next/link';
import { appRouter } from '@/lib/trpc/root';
import { createTRPCContext } from '@/lib/trpc/server';
import { PredictionCard } from '@/features/predictions/PredictionCard';
import ArticleCard from '@/features/articles/ArticleCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowRightIcon, LockIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export const dynamic = 'force-dynamic';

async function PredictionsSection() {
  const context = await createTRPCContext();
  const caller = appRouter.createCaller(context);
  const { today, tomorrow, weekend } = await caller.predictions.getHomepagePredictions();

  const renderPredictionList = (predictions: typeof today, title: string) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {predictions.length > 0 ? (
        predictions.map((p) => <PredictionCard key={p.id} prediction={p} />)
      ) : (
        <p className="col-span-full text-center text-muted-foreground">No {title} predictions available yet.</p>
      )}
    </div>
  );

  return (
    <section className="py-16 sm:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">Today&apos;s Top Predictions</h2>
          <p className="mt-4 text-lg text-muted-foreground">Expert analysis for today&apos;s matches, updated daily.</p>
        </div>
        <Tabs defaultValue="today" className="w-full">
          <TabsList className="grid max-w-md mx-auto w-full grid-cols-3 bg-muted/50 border border-border">
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="tomorrow">Tomorrow</TabsTrigger>
            <TabsTrigger value="weekend">Weekend</TabsTrigger>
          </TabsList>
          <TabsContent value="today" className="mt-10">
            {renderPredictionList(today, 'today')}
          </TabsContent>
          <TabsContent value="tomorrow" className="mt-10">
            {renderPredictionList(tomorrow, 'tomorrow')}
          </TabsContent>
          <TabsContent value="weekend" className="mt-10">
            {renderPredictionList(weekend, 'weekend')}
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}

async function ArticlesSection() {
  const context = await createTRPCContext();
  const caller = appRouter.createCaller(context);
  const recentArticles = await caller.articles.getRecent({ limit: 8 });

  return (
    <section className="py-8 sm:py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {recentArticles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
        <div className="text-center mt-8">
          <Link href="/articles">
            <Button variant="outline">
              More Articles <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

function PremiumSection() {
  return (
    <section className="py-16 sm:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <LockIcon className="mx-auto h-12 w-12 text-accent" />
          <h2 className="mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">Unlock Premium Access</h2>
          <p className="mt-4 text-lg text-muted-foreground">Gain an edge with our most confident predictions, detailed analysis, and more.</p>
        </div>
        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 blur-md pointer-events-none">
            {/* Placeholder for blurred premium predictions */}
          </div>
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-lg">
            <Link href="/premium">
              <Button size="lg" variant="gold">
                Upgrade Now
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionSkeleton() {
  return (
    <div className="container mx-auto px-4 py-16 sm:py-24">
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
<div className="min-h-screen bg-background text-foreground">
      <Suspense fallback={<SectionSkeleton />}>
        <PredictionsSection />
      </Suspense>
      <Suspense fallback={<SectionSkeleton />}>
        <ArticlesSection />
      </Suspense>
      <PremiumSection />
    </div>
  );
}
