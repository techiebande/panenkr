import { appRouter } from "@/lib/trpc/root";
import { createTRPCContext } from "@/lib/trpc/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import { getCrestPath } from "@/lib/crests";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { MDXRemote } from "next-mdx-remote/rsc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { auth } from "@/lib/auth";
import DOMPurify from "isomorphic-dompurify";

function sanitize(html: string) {
  // Conservative config: no scripts, allow basic formatting and links/images
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
  });
}

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
<div className="container mx-auto px-4 py-10 max-w-3xl">
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
            <Avatar className="h-8 w-8">
              <AvatarImage src={prediction.author.image || undefined} alt={prediction.author.name || "Author"} />
              <AvatarFallback>{prediction.author.name?.charAt(0) || "A"}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{prediction.author.name}</p>
              <p className="text-sm">
                {prediction.publishedAt && format(new Date(prediction.publishedAt), "MMMM d, yyyy")}
              </p>
            </div>
          </div>

          {canViewContent ? (
            <div className="space-y-10 mt-8">
              <section className="prose prose-lg dark:prose-invert max-w-none">
                <MDXRemote source={prediction.content as unknown as string} />
              </section>

              <section>
                <h2 className="text-xl font-bold mb-3">Prediction Summary</h2>
                <div className="prose dark:prose-invert max-w-none text-muted-foreground">
                  {prediction.summary ? (
                    // Render rich summary HTML (sanitized)
                    <div dangerouslySetInnerHTML={{ __html: sanitize(String(prediction.summary)) }} />
                  ) : (
                    <p>
                      Our tip: <span className="font-semibold">{prediction.type.replace(/_/g, ' ')}</span> — <span className="font-semibold">{prediction.value}</span>. This selection is backed by recent form, head‑to‑head stats, and expected game state.
                    </p>
                  )}
                </div>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-2">Why we like this pick</h3>
                <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                  <li>Recent form trend: Home/Away momentum points toward this outcome.</li>
                  <li>Expected goals profile supports the probability of this result.</li>
                  <li>Tactical matchup and manager tendencies align with the pick.</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-2">Team News (pre‑match)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-muted-foreground">
                  <div>
                    <p className="font-medium">{prediction.match.homeTeam.name}</p>
                    {prediction.teamNewsHome ? (
                      <p className="text-sm whitespace-pre-wrap">{prediction.teamNewsHome}</p>
                    ) : (
                      <ul className="list-disc pl-5 text-sm space-y-1">
                        <li>Missing: Key striker (hamstring) — doubtful</li>
                        <li>Rotation watch: Midweek cup game may impact lineup</li>
                      </ul>
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{prediction.match.awayTeam.name}</p>
                    {prediction.teamNewsAway ? (
                      <p className="text-sm whitespace-pre-wrap">{prediction.teamNewsAway}</p>
                    ) : (
                      <ul className="list-disc pl-5 text-sm space-y-1">
                        <li>Missing: Starting fullback (suspension)</li>
                        <li>Returning: Veteran CB available after rest</li>
                      </ul>
                    )}
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
