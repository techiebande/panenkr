import PredictionForm from "@/features/predictions/PredictionForm";
import MatchResultManager from "@/features/predictions/MatchResultManager";
import { appRouter } from "@/lib/trpc/root";
import { createTRPCContext } from "@/lib/trpc/server";

type EditPredictionPageProps = {
  params: Promise<{
    predictionId: string;
  }>;
};

export default async function EditPredictionPage({
  params,
}: EditPredictionPageProps) {
  const { predictionId } = await params;

  const serverContext = await createTRPCContext();
  const serverCaller = appRouter.createCaller(serverContext);

  const prediction = await serverCaller.predictions.getById({
    id: predictionId,
  });

  return (
    <div className="space-y-8">
      <PredictionForm initialData={prediction} />
      <div className="p-4 sm:p-8 max-w-4xl mx-auto">
        <MatchResultManager 
          prediction={{
            id: prediction.id,
            title: prediction.title,
            type: prediction.type,
            value: prediction.value,
            confidence: prediction.confidence,
            result: prediction.result,
            resultNote: prediction.resultNote,
            actualOutcome: prediction.actualOutcome,
            evaluatedAt: prediction.evaluatedAt,
            match: {
              id: prediction.match.id,
              homeTeam: prediction.match.homeTeam,
              awayTeam: prediction.match.awayTeam,
              status: prediction.match.status,
              scoreHome: prediction.match.scoreHome,
              scoreAway: prediction.match.scoreAway,
              htScoreHome: prediction.match.htScoreHome,
              htScoreAway: prediction.match.htScoreAway,
              finishedAt: prediction.match.finishedAt,
            },
          }}
        />
      </div>
    </div>
  );
}
