"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
// Temporary type definitions for enums
type MatchStatus = "SCHEDULED" | "LIVE" | "FINISHED" | "POSTPONED" | "CANCELLED";
type PredictionResult = "PENDING" | "WON" | "LOST" | "VOID";

import { trpc } from "@/lib/trpc/client";
import { updateMatchResultSchema, updatePredictionResultSchema, UpdateMatchResultInput, UpdatePredictionResultInput } from "./prediction.schema";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  Trophy, 
  X, 
  CheckCircle,
  AlertCircle,
  Clock,
  Target
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type PredictionWithMatch = {
  id: string;
  title: string;
  type: string;
  value: string;
  confidence: number;
  result: PredictionResult;
  resultNote?: string | null;
  actualOutcome?: string | null;
  evaluatedAt?: Date | null;
  match: {
    id: string;
    homeTeam: { name: string };
    awayTeam: { name: string };
    status: MatchStatus;
    scoreHome?: number | null;
    scoreAway?: number | null;
    htScoreHome?: number | null;
    htScoreAway?: number | null;
    finishedAt?: Date | null;
  };
};

type MatchResultManagerProps = {
  prediction: PredictionWithMatch;
  onUpdate?: () => void;
};

function MatchResultForm({ match, onUpdate }: { match: PredictionWithMatch['match'], onUpdate?: () => void }) {
  const [open, setOpen] = useState(false);
  
  const form = useForm<UpdateMatchResultInput>({
    resolver: zodResolver(updateMatchResultSchema),
    defaultValues: {
      id: match.id,
      status: match.status,
      scoreHome: match.scoreHome || undefined,
      scoreAway: match.scoreAway || undefined,
      htScoreHome: match.htScoreHome || undefined,
      htScoreAway: match.htScoreAway || undefined,
    },
  });

  const updateMatchResult = trpc.predictions.updateMatchResult.useMutation({
    onSuccess: () => {
      toast.success("Match result updated successfully!");
      setOpen(false);
      onUpdate?.();
    },
    onError: (error) => {
      toast.error("Failed to update match result", {
        description: error.message,
      });
    },
  });

  const onSubmit = (data: UpdateMatchResultInput) => {
    updateMatchResult.mutate(data);
  };

  const getStatusColor = (status: MatchStatus) => {
    switch (status) {
      case "SCHEDULED": return "bg-blue-100 text-blue-800";
      case "LIVE": return "bg-green-100 text-green-800";
      case "FINISHED": return "bg-gray-100 text-gray-800";
      case "POSTPONED": return "bg-yellow-100 text-yellow-800";
      case "CANCELLED": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="mr-2 h-4 w-4" />
          Update Match
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Update Match Result</DialogTitle>
          <DialogDescription>
            {match.homeTeam.name} vs {match.awayTeam.name}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Match Status */}
            <FormField
              name="status"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Match Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                      <SelectItem value="LIVE">Live</SelectItem>
                      <SelectItem value="FINISHED">Finished</SelectItem>
                      <SelectItem value="POSTPONED">Postponed</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Scores */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                name="scoreHome"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{match.homeTeam.name}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="scoreAway"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{match.awayTeam.name}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Half-time scores */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                name="htScoreHome"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>HT - {match.homeTeam.name}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="htScoreAway"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>HT - {match.awayTeam.name}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateMatchResult.isPending}>
                {updateMatchResult.isPending ? "Saving..." : "Save Result"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function PredictionResultForm({ prediction, onUpdate }: { prediction: PredictionWithMatch, onUpdate?: () => void }) {
  const [open, setOpen] = useState(false);
  
  const form = useForm<UpdatePredictionResultInput>({
    resolver: zodResolver(updatePredictionResultSchema),
    defaultValues: {
      id: prediction.id,
      result: prediction.result,
      resultNote: prediction.resultNote || "",
      actualOutcome: prediction.actualOutcome || "",
    },
  });

  const updatePredictionResult = trpc.predictions.updatePredictionResult.useMutation({
    onSuccess: () => {
      toast.success("Prediction result updated!");
      setOpen(false);
      onUpdate?.();
    },
    onError: (error) => {
      toast.error("Failed to update prediction result", {
        description: error.message,
      });
    },
  });

  const onSubmit = (data: UpdatePredictionResultInput) => {
    updatePredictionResult.mutate(data);
  };

  const getResultIcon = (result: PredictionResult) => {
    switch (result) {
      case "WON": return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "LOST": return <X className="h-4 w-4 text-red-600" />;
      case "VOID": return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getResultColor = (result: PredictionResult) => {
    switch (result) {
      case "WON": return "bg-green-100 text-green-800";
      case "LOST": return "bg-red-100 text-red-800";
      case "VOID": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Target className="mr-2 h-4 w-4" />
          Evaluate Prediction
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Evaluate Prediction Result</DialogTitle>
          <DialogDescription>
            Determine if this prediction was correct
          </DialogDescription>
        </DialogHeader>

        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="font-medium text-sm">Prediction: {prediction.title}</p>
          <p className="text-sm text-gray-600">
            Type: {prediction.type} | Value: {prediction.value} | Confidence: {prediction.confidence}/10
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              name="result"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Result</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="PENDING">
                        <div className="flex items-center">
                          <Clock className="mr-2 h-4 w-4 text-gray-600" />
                          Pending
                        </div>
                      </SelectItem>
                      <SelectItem value="WON">
                        <div className="flex items-center">
                          <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                          Won (Correct)
                        </div>
                      </SelectItem>
                      <SelectItem value="LOST">
                        <div className="flex items-center">
                          <X className="mr-2 h-4 w-4 text-red-600" />
                          Lost (Incorrect)
                        </div>
                      </SelectItem>
                      <SelectItem value="VOID">
                        <div className="flex items-center">
                          <AlertCircle className="mr-2 h-4 w-4 text-yellow-600" />
                          Void (Cancelled)
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="actualOutcome"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What Actually Happened</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Man City won 2-1"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Describe the actual match outcome
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="resultNote"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Evaluation Note</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Explain why this prediction won/lost..."
                      className="min-h-[60px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional explanation of the result
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updatePredictionResult.isPending}>
                {updatePredictionResult.isPending ? "Saving..." : "Save Evaluation"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default function MatchResultManager({ prediction, onUpdate }: MatchResultManagerProps) {
  const { match } = prediction;

  const getStatusColor = (status: MatchStatus) => {
    switch (status) {
      case "SCHEDULED": return "bg-blue-100 text-blue-800";
      case "LIVE": return "bg-green-100 text-green-800";
      case "FINISHED": return "bg-gray-100 text-gray-800";
      case "POSTPONED": return "bg-yellow-100 text-yellow-800";
      case "CANCELLED": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getResultColor = (result: PredictionResult) => {
    switch (result) {
      case "WON": return "bg-green-100 text-green-800";
      case "LOST": return "bg-red-100 text-red-800";
      case "VOID": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <Trophy className="mr-2 h-5 w-5" />
            Match & Result Management
          </span>
          <Badge className={getStatusColor(match.status)}>
            {match.status}
          </Badge>
        </CardTitle>
        <CardDescription>
          Update match results and evaluate prediction accuracy
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Match Information */}
        <div>
          <h4 className="font-medium mb-3">Match Details</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Teams</p>
              <p className="font-medium">{match.homeTeam.name} vs {match.awayTeam.name}</p>
            </div>
            <div>
              <p className="text-gray-600">Status</p>
              <Badge className={getStatusColor(match.status)} variant="secondary">
                {match.status}
              </Badge>
            </div>
            {(match.scoreHome !== null && match.scoreAway !== null) && (
              <div>
                <p className="text-gray-600">Score</p>
                <p className="font-medium text-lg">{match.scoreHome} - {match.scoreAway}</p>
              </div>
            )}
            {(match.htScoreHome !== null && match.htScoreAway !== null) && (
              <div>
                <p className="text-gray-600">Half-time</p>
                <p className="font-medium">HT: {match.htScoreHome} - {match.htScoreAway}</p>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Prediction Information */}
        <div>
          <h4 className="font-medium mb-3">Prediction Status</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Result</p>
              <Badge className={getResultColor(prediction.result)} variant="secondary">
                {prediction.result}
              </Badge>
            </div>
            <div>
              <p className="text-gray-600">Predicted</p>
              <p className="font-medium">{prediction.type}: {prediction.value}</p>
            </div>
            {prediction.actualOutcome && (
              <div>
                <p className="text-gray-600">Actual Outcome</p>
                <p className="font-medium">{prediction.actualOutcome}</p>
              </div>
            )}
            {prediction.evaluatedAt && (
              <div>
                <p className="text-gray-600">Evaluated</p>
                <p className="text-sm">{new Date(prediction.evaluatedAt).toLocaleDateString()}</p>
              </div>
            )}
          </div>
          {prediction.resultNote && (
            <div className="mt-3">
              <p className="text-gray-600 text-sm">Evaluation Note</p>
              <p className="text-sm bg-gray-50 p-2 rounded">{prediction.resultNote}</p>
            </div>
          )}
        </div>

        <Separator />

        {/* Actions */}
        <div className="flex space-x-3">
          <MatchResultForm match={match} onUpdate={onUpdate} />
          <PredictionResultForm prediction={prediction} onUpdate={onUpdate} />
        </div>
      </CardContent>
    </Card>
  );
}