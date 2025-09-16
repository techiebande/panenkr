import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  AlertTriangle, 
  Clock, 
  Trophy, 
  Target,
  CheckCircle,
  XCircle 
} from "lucide-react";
import { format } from "date-fns";

import { appRouter } from "@/lib/trpc/root";
import { createTRPCContext } from "@/lib/trpc/server";

export default async function EvaluationsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  if (session.user.role !== "ADMIN" && session.user.role !== "EDITOR") {
    return (
      <div className="p-4 sm:p-8">
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-gray-600">You don't have permission to evaluate predictions.</p>
      </div>
    );
  }

  const serverContext = await createTRPCContext();
  const serverCaller = appRouter.createCaller(serverContext);

  const pendingPredictions = await serverCaller.predictions.getPendingEvaluations();

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center">
          <Target className="mr-2 h-6 w-6" />
          Prediction Evaluations
        </h1>
        <p className="text-gray-600">
          Review finished matches and evaluate prediction accuracy
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Evaluations</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingPredictions.length}</div>
            <p className="text-xs text-muted-foreground">
              Finished matches waiting for review
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
            <Trophy className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {pendingPredictions.length > 0 ? (
                <p className="text-sm text-blue-600">Ready to evaluate</p>
              ) : (
                <p className="text-sm text-gray-500">All caught up!</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              {pendingPredictions.length === 0 ? (
                <Badge variant="default" className="bg-green-100 text-green-800">
                  All Updated
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                  {pendingPredictions.length} Pending
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Evaluations */}
      {pendingPredictions.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Matches Requiring Evaluation</h2>
          <div className="grid gap-4">
            {pendingPredictions.map((prediction) => (
              <Card key={prediction.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {prediction.match.homeTeam.name} vs {prediction.match.awayTeam.name}
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="bg-gray-100">
                        {prediction.match.status}
                      </Badge>
                      <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                        <Clock className="mr-1 h-3 w-3" />
                        Pending
                      </Badge>
                    </div>
                  </div>
                  <CardDescription>
                    Match finished • Prediction needs evaluation
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Match Result */}
                  {(prediction.match.scoreHome !== null && prediction.match.scoreAway !== null) && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Match Result</h4>
                      <div className="text-2xl font-bold text-center">
                        {prediction.match.homeTeam.name} {prediction.match.scoreHome} - {prediction.match.scoreAway} {prediction.match.awayTeam.name}
                      </div>
                      {(prediction.match.htScoreHome !== null && prediction.match.htScoreAway !== null) && (
                        <p className="text-center text-sm text-gray-600 mt-1">
                          HT: {prediction.match.htScoreHome} - {prediction.match.htScoreAway}
                        </p>
                      )}
                      {prediction.match.finishedAt && (
                        <p className="text-center text-xs text-gray-500 mt-2">
                          Finished: {format(new Date(prediction.match.finishedAt), "MMM d, yyyy 'at' HH:mm")}
                        </p>
                      )}
                    </div>
                  )}

                  <Separator />

                  {/* Prediction Details */}
                  <div>
                    <h4 className="font-medium mb-3">Prediction to Evaluate</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Title</p>
                        <p className="font-medium">{prediction.title}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Type</p>
                        <p className="font-medium">{prediction.type}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Predicted</p>
                        <p className="font-medium">{prediction.value}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Confidence</p>
                        <p className="font-medium">{prediction.confidence}/10</p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Actions */}
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                      Author: {prediction.author.name || prediction.author.email}
                    </div>
                    <Button asChild>
                      <Link href={`/dashboard/predictions/${prediction.id}/edit`}>
                        <Target className="mr-2 h-4 w-4" />
                        Evaluate Prediction
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="mr-2 h-5 w-5 text-green-600" />
              All Caught Up!
            </CardTitle>
            <CardDescription>
              No predictions need evaluation at this time.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Trophy className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600 mb-4">
                All finished matches have been evaluated. Great work keeping up with prediction accuracy tracking!
              </p>
              <div className="text-sm text-gray-500">
                <p>When matches finish, they'll appear here for evaluation.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}