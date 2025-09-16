import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DeletePredictionAction from "@/features/predictions/DeletePredictionAction";
import { Edit } from "lucide-react";

import { appRouter } from "@/lib/trpc/root";
import { createTRPCContext } from "@/lib/trpc/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, TrendingUp, AlertTriangle } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

import { MoreVertical } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  if (session.user.role !== "ADMIN" && session.user.role !== "EDITOR") {
    return (
      <div>
        <h1>Access Denied</h1>
      </div>
    );
  }

  const serverContext = await createTRPCContext();
  const serverCaller = appRouter.createCaller(serverContext);

  const predictions = await serverCaller.predictions.list();
  const pendingEvaluations = await serverCaller.predictions.getPendingEvaluations();
  
  // Get stats for current user if they have predictions
  let userStats = null;
  if (session.user.id) {
    try {
      userStats = await serverCaller.predictions.getAuthorStats({ authorId: session.user.id });
    } catch {
      // User might not have any predictions yet
    }
  }

  return (
    <div className="p-4 sm:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Predictions dashboard</h1>
        <Button asChild>
          <Link href="/dashboard/predictions/new">Create New Prediction</Link>
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Predictions</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{predictions?.length || 0}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        
        {userStats && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Your Accuracy</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.accuracy}%</div>
              <p className="text-xs text-muted-foreground">
                {userStats.won}/{userStats.won + userStats.lost} correct
              </p>
            </CardContent>
          </Card>
        )}
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Evaluations</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingEvaluations.length}</div>
            <p className="text-xs text-muted-foreground">
              {pendingEvaluations.length > 0 ? (
                <Link href="/dashboard/evaluations" className="text-orange-600 hover:underline">
                  Review needed
                </Link>
              ) : (
                "All caught up!"
              )}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {predictions?.filter(p => p.publishStatus === "PUBLISHED").length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Live predictions</p>
          </CardContent>
        </Card>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">Title</TableHead>
              <TableHead>Match</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Author</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {predictions && predictions.length > 0 ? (
              predictions.map((prediction) => (
                <TableRow key={prediction.id}>
                  <TableCell className="font-medium">
                    {prediction.title}
                  </TableCell>
                  <TableCell>
                    {prediction.match.homeTeam.name} vs{" "}
                    {prediction.match.awayTeam.name}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        prediction.publishStatus === "PUBLISHED"
                          ? "default"
                          : "outline"
                      }
                    >
                      {prediction.publishStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>{prediction.author.name}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link
                            href={`/dashboard/predictions/${prediction.id}/edit`}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Edit</span>
                          </Link>
                        </DropdownMenuItem>
                        {/* Add our new Delete component here */}
                        <DeletePredictionAction
                          predictionId={prediction.id}
                          predictionTitle={prediction.title}
                        />
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24">
                  No predictions found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
