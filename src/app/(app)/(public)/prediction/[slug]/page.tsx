import { appRouter } from "@/lib/trpc/root";
import { createTRPCContext } from "@/lib/trpc/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import { getCrestPath } from "@/lib/crests";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
// removed author avatar display
import { Separator } from "@/components/ui/separator";
import TiptapRenderer from "@/components/TiptapRenderer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { auth } from "@/lib/auth";
// removed DOMPurify; using TiptapRenderer to render sanitized html


function jsonLdForPrediction(p: { title: string; publishedAt?: Date | string | null; author?: { name?: string | null } | null; match?: { homeTeam?: { name: string }; awayTeam?: { name: string } }; isPremium: boolean; type: string; value: string }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": p.title,
    "datePublished": p.publishedAt ?? new Date().toISOString(),
    "author": p.author?.name ? { "@type": "Person", name: p.author.name } : undefined,
    "about": [p.match?.homeTeam?.name, p.match?.awayTeam?.name].filter(Boolean),
    "isAccessibleForFree": !p.isPremium,
    "keywords": [p.type, p.value].filter(Boolean),
  };
  return JSON.stringify(data);
}

export default async function PredictionPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const serverContext = await createTRPCContext();
  const serverCaller = appRouter.createCaller(serverContext);
  const session = await auth();

  const prediction = await serverCaller.predictions.getPublicBySlug({ slug });

  if (!prediction) {
    notFound();
  }

  const isPremiumUser = Boolean((session?.user as { isPremium?: boolean })?.isPremium);
  const canViewContent = !prediction.isPremium || isPremiumUser;

  return (
    <>
      {/* JSON-LD structured data */}
      <script type="application/ld+json" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: jsonLdForPrediction(prediction) }} />
<div className="container mx-auto px-4 pt-6 pb-8 max-w-3xl">
      <Card className="mb-8 shadow-lg">
<CardHeader className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-4 mb-4">
            {prediction.match.league?.logo && (
              <Image src={prediction.match.league.logo} alt={prediction.match.league.name} width={30} height={30} className="rounded-full" />
            )}
            <p className="text-md text-gray-600 font-semibold">{prediction.match.league?.name}</p>
          </div>
          <CardTitle className="text-2xl font-bold mb-4">
            <div className="flex items-center justify-center space-x-4">
              <div className="flex flex-col items-center">
                {prediction.match.homeTeam.crestUrl && (
                  <Image src={getCrestPath(prediction.match.homeTeam.name, prediction.match.homeTeam.crestUrl)} alt={prediction.match.homeTeam.name} width={60} height={60} className="mb-1" />
                )}
                <span className="text-lg font-semibold">{prediction.match.homeTeam.name}</span>
              </div>
              <span className="text-3xl font-extrabold text-gray-500">VS</span>
              <div className="flex flex-col items-center">
                {prediction.match.awayTeam.crestUrl && (
                  <Image src={getCrestPath(prediction.match.awayTeam.name, prediction.match.awayTeam.crestUrl)} alt={prediction.match.awayTeam.name} width={60} height={60} className="mb-1" />
                )}
                <span className="text-lg font-semibold">{prediction.match.awayTeam.name}</span>
              </div>
            </div>
          </CardTitle>
              <p className="text-md text-muted-foreground">
                Kickoff: {format(new Date(prediction.match.kickoffAt), "MMM d, yyyy HH:mm")}
              </p>
          {prediction.isPremium && (
            <Badge variant="premium" className="mt-2 text-lg px-3 py-1">Premium Prediction</Badge>
          )}
        </CardHeader>
        <CardContent>
<Separator className="my-8" />

          <h1 className="text-3xl font-extrabold tracking-tight mb-4 text-center">
            {prediction.title}
          </h1>

          <div className="flex items-center justify-center space-x-4 text-muted-foreground mb-6">
            <p className="text-sm">
              {prediction.publishedAt && format(new Date(prediction.publishedAt), "MMMM d, yyyy")}
            </p>
          </div>

          {canViewContent ? (
            <div className="space-y-10 mt-8">
              <section className="prose prose-lg dark:prose-invert max-w-none">
                <TiptapRenderer content={String(prediction.content || "")} />
              </section>

              <section>
                <h2 className="text-xl font-bold mb-3">Prediction Summary</h2>
                <div className="prose dark:prose-invert max-w-none text-muted-foreground">
                  {prediction.summary ? (
                    <TiptapRenderer content={String(prediction.summary)} />
                  ) : null}
                </div>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-2">Team News (pre‑match)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-muted-foreground">
                  <div>
                    <p className="font-medium">{prediction.match.homeTeam.name}</p>
                    {prediction.teamNewsHome ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <TiptapRenderer content={String(prediction.teamNewsHome)} />
                      </div>
                    ) : null}
                  </div>
                  <div>
                    <p className="font-medium">{prediction.match.awayTeam.name}</p>
                    {prediction.teamNewsAway ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <TiptapRenderer content={String(prediction.teamNewsAway)} />
                      </div>
                    ) : null}
                  </div>
                </div>
              </section>

              <section className="rounded-lg border border-border p-4">
                <h3 className="text-lg font-semibold mb-2">Confidence</h3>
                <div className="w-full bg-muted rounded-full h-2.5">
                  <div className="bg-success h-2.5 rounded-full" style={{ width: `${prediction.confidence * 10}%` }} />
                </div>
                <p className="mt-2 text-sm text-muted-foreground">Confidence score: {prediction.confidence}/10</p>
              </section>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center bg-muted p-8 rounded-lg mt-8">
              <Lock className="h-16 w-16 text-accent mb-6" />
              <p className="text-2xl font-bold text-foreground mb-4 text-center">Unlock This Premium Prediction</p>
              <p className="text-lg text-muted-foreground mb-6 text-center">This content is exclusive to our premium subscribers. Subscribe now to get full access to all expert predictions and insights!</p>
              <Button asChild size="lg" variant="gold" className="font-bold py-3 px-6 rounded-full">
                <Link href="/subscribe">Become a Premium Member</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
    </>
  );
}
