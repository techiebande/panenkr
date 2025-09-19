"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { inferRouterOutputs } from "@trpc/server";
import { appRouter } from "@/lib/trpc/root";
import Image from "next/image";
import { getCrestPath } from "@/lib/crests";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

type HomepagePrediction = inferRouterOutputs<typeof appRouter>["predictions"]["getHomepagePredictions"]["today"][0];
type PublicPrediction = inferRouterOutputs<typeof appRouter>["predictions"]["getPublic"]["free"][0];

type Prediction = HomepagePrediction | PublicPrediction;

interface PredictionCardProps {
  prediction: Prediction;
}

const PredictionCard = ({ prediction }: PredictionCardProps) => {
  const { match, type, value, confidence, isPremium, slug } = prediction;
  const router = useRouter();
  const { homeTeam, awayTeam, league, kickoffAt } = match;

  const formattedTime = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(kickoffAt));

  return (
    <Link href={`/prediction/${slug}`} className="block group h-full">
<Card className="group h-full flex flex-col overflow-hidden border-2 border-transparent hover:border-primary/30 hover:shadow-xl transition-all duration-300">
        <CardHeader className="p-4 pb-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="truncate max-w-[60%]">{league?.name || "League"}</span>
            <span>{formattedTime}</span>
          </div>
          <div className="flex items-center justify-center gap-6 pt-3">
            <div className="flex items-center gap-3 min-w-0">
              <Image src={getCrestPath(homeTeam.name, homeTeam.crestUrl || "/placeholder.svg")} alt={homeTeam.name} width={44} height={44} className="object-contain drop-shadow-sm" />
              <span className="text-sm font-semibold text-foreground truncate">{homeTeam.name}</span>
            </div>
            <span className="text-lg font-bold text-muted-foreground">vs</span>
            <div className="flex items-center gap-3 min-w-0">
              <Image src={getCrestPath(awayTeam.name, awayTeam.crestUrl || "/placeholder.svg")} alt={awayTeam.name} width={44} height={44} className="object-contain drop-shadow-sm" />
              <span className="text-sm font-semibold text-foreground truncate">{awayTeam.name}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 flex-1">
          <div className="mt-1 grid grid-cols-3 items-center gap-2">
            <div className="text-left">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Type</p>
              <p className="text-sm font-medium text-foreground">{type.replace(/_/g, ' ')}</p>
            </div>
            <div className="text-center relative">
              <p className="text-[11px] uppercase tracking-wide text-primary/80 flex items-center justify-center gap-1">
                Pick {isPremium && <Lock className="h-4 w-4 text-primary/70" />}
              </p>
              <p className={"text-2xl font-extrabold text-primary " + (isPremium ? "blur-sm select-none" : "") }>
                {value || "—"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Confidence</p>
              <div className={"w-full bg-muted rounded-full h-2 " + (isPremium ? "blur-sm" : "") }>
                <div className="bg-success h-2 rounded-full" style={{ width: `${confidence * 10}%` }} />
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-4 flex justify-between items-center">
          {isPremium ? (
            <Button
              size="sm"
              variant="gold"
              className="rounded-full w-full sm:w-auto px-4 py-2 gap-2"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                router.push("/subscribe");
              }}
            >
              <Lock className="h-4 w-4" /> Unlock Now
            </Button>
          ) : (
            <div />
          )}
          {isPremium && (
            <Badge variant="gold">Premium</Badge>
          )}
        </CardFooter>
      </Card>
    </Link>
  );
};

export { PredictionCard };
