import { appRouter } from "@/lib/trpc/root";
import { createTRPCContext } from "@/lib/trpc/server";
import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LockIcon } from "lucide-react";
import { PredictionCard } from "@/features/predictions/PredictionCard";
import { Skeleton } from "@/components/ui/skeleton";
import { PredictionsFilters } from "@/components/filters/PredictionsFilters";

function GridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="h-48 w-full" />
      ))}
    </div>
  );
}

async function PredictionsList({
  date,
  page,
  limit = 24,
}: {
  date: "all" | "today" | "tomorrow" | "weekend";
  page: number;
  limit?: number;
}) {
  const context = await createTRPCContext();
  const caller = appRouter.createCaller(context);
  const { free, premium, meta } = await caller.predictions.getPublic({
    date,
    page,
    limit,
  });

  return (
    <div className="space-y-16">
      <div>
        <h2 className="text-2xl font-bold mb-6">Free Predictions</h2>
        {free.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {free.map((p) => (
              <PredictionCard key={p.id} prediction={p} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">
            No free predictions available for this period.
          </p>
        )}
      </div>

      <div>
        <div className="text-center mb-6">
          <LockIcon className="mx-auto h-10 w-10 text-accent" />
          <h2 className="mt-3 text-xl font-semibold">Premium Predictions</h2>
          <p className="mt-1 text-muted-foreground">
            Unlock our most confident tips and in‑depth analysis.
          </p>
        </div>
        {premium.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {premium.map((p) => (
              <PredictionCard key={p.id} prediction={p} />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground">
            No premium predictions for this period yet.
          </p>
        )}
      </div>
      {/* Pagination */}
      <div className="mt-12 flex items-center justify-center gap-4">
        {page > 1 ? (
          <Button asChild variant="outline">
            <Link href={{ pathname: "/predictions", query: { date, page: page - 1 } }}>Previous</Link>
          </Button>
        ) : (
          <Button variant="outline" disabled>Previous</Button>
        )}
        {meta.totalPages && page >= meta.totalPages ? (
          <Button variant="outline" disabled>Next</Button>
        ) : (
          <Button asChild variant="outline">
            <Link href={{ pathname: "/predictions", query: { date, page: page + 1 } }}>Next</Link>
          </Button>
        )}
      </div>
    </div>
  );
}

function Filters({
  currentDate,
  currentType,
  currentSort,
}: {
  currentDate: string;
  currentType: string;
  currentSort: string;
}) {
  return (
    <div className="mb-8">
      <PredictionsFilters
        currentDate={currentDate}
        currentType={currentType}
        currentSort={currentSort}
      />
    </div>
  );
}

function jsonLdForPredictionsList() {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Football Predictions",
    description: "Browse football predictions by date and type.",
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "/" },
        {
          "@type": "ListItem",
          position: 2,
          name: "Predictions",
          item: "/predictions",
        },
      ],
    },
  };
  return JSON.stringify(data);
}

export default async function PredictionsPage(props: {
  searchParams: Promise<{ date?: string; type?: string; sort?: string; page?: string }>;
}) {
  const { date, type, sort, page } = await props.searchParams;
  const dateFilter = (date as string) ?? "all";
  const typeFilter = (type as string) ?? "ALL";
  const sortFilter = (sort as string) ?? "DATE_DESC";
  const pageNumber = Number(page ?? "1");

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: jsonLdForPredictionsList() }}
      />
      <div className="container mx-auto px-4">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold">Football Predictions</h1>
          <p className="mt-2 text-muted-foreground">
            Browse today’s tips and upcoming picks.
          </p>
        </div>
        <Filters
          currentDate={dateFilter}
          currentType={typeFilter}
          currentSort={sortFilter}
        />
        <Suspense fallback={<GridSkeleton />}>
          {/* @ts-expect-error Async Server Component */}
          <PredictionsList date={dateFilter} page={pageNumber} />
        </Suspense>
      </div>
    </div>
  );
}
