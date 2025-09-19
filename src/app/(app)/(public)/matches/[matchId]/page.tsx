import { appRouter } from "@/lib/trpc/root";
import { createTRPCContext } from "@/lib/trpc/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import { getCrestPath } from "@/lib/crests";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PredictionCard } from "@/features/predictions/PredictionCard";

interface MatchPageProps {
  params: {
    matchId: string;
  };
}

export default async function MatchPage({ params }: MatchPageProps) {
  const serverContext = await createTRPCContext();
  const serverCaller = appRouter.createCaller(serverContext);

  const match = await serverCaller.matches.getPublicById({ id: params.matchId });

  if (!match) {
    notFound();
  }

  const predictions = await serverCaller.predictions.getPublicByMatchId({ matchId: params.matchId });

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="mb-8 shadow-lg">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-4 mb-4">
            {match.league?.logo && (
              <Image src={match.league.logo} alt={match.league.name} width={40} height={40} className="rounded-full" />
            )}
            <p className="text-lg text-muted-foreground font-semibold">{match.league?.name}</p>
          </div>
          <CardTitle className="text-3xl font-bold mb-4">
            <div className="flex items-center justify-center space-x-6">
              <div className="flex flex-col items-center">
                <Image src={getCrestPath(match.homeTeam.name, match.homeTeam.crestUrl || '')} alt={match.homeTeam.name} width={80} height={80} className="mb-2" />
                <span className="text-xl font-semibold">{match.homeTeam.name}</span>
              </div>
              <span className="text-4xl font-extrabold text-muted-foreground">VS</span>
              <div className="flex flex-col items-center">
                <Image src={getCrestPath(match.awayTeam.name, match.awayTeam.crestUrl || '')} alt={match.awayTeam.name} width={80} height={80} className="mb-2" />
                <span className="text-xl font-semibold">{match.awayTeam.name}</span>
              </div>
            </div>
          </CardTitle>
          <p className="text-md text-muted-foreground">
            Kickoff: {format(new Date(match.kickoffAt), "MMM d, yyyy HH:mm")}
          </p>
          {match.status === "FINISHED" && (
            <p className="text-2xl font-bold mt-2">
               Final Score: {match.scoreHome} - {match.scoreAway}
            </p>
          )}
        </CardHeader>
        <CardContent>
          <Separator className="my-6" />
          <h2 className="text-2xl font-bold mb-4 text-center">Predictions for this Match</h2>
          {predictions && predictions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {predictions.map((prediction) => (
                <div key={prediction.id} className="relative group">
                  <PredictionCard prediction={prediction} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              <p className="text-xl mb-4">No predictions available for this match yet.</p>
              <p>Check back soon!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
