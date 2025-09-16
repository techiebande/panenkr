
"use client";

import { MatchWithTeams } from "@/features/matches/match.router";
import { Combobox } from "@/components/ui/combobox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { createMatchSchema } from "@/features/matches/match.schema";
import { trpc } from "@/lib/trpc/client";
import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { z } from "zod";
import { toast } from "sonner";
import { Match, MatchStatus } from "@prisma/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

type MatchFormValues = z.infer<typeof createMatchSchema>;

type MatchFormProps = {
  initialData?: MatchWithTeams | null;
};

export default function MatchForm({ initialData }: MatchFormProps) {
  const router = useRouter();
  const isEditMode = !!initialData;

  const form = useForm<MatchFormValues>({
    resolver: zodResolver(createMatchSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          kickoffAt: new Date(initialData.kickoffAt),
        }
      : {
          homeTeamId: "",
          awayTeamId: "",
          leagueId: "",
          kickoffAt: new Date(),
          status: MatchStatus.SCHEDULED,
          scoreHome: undefined,
          scoreAway: undefined,
        },
    mode: "onChange",
  });

  const { data: teams } = trpc.teams.list.useQuery();
  const { data: leagues } = trpc.leagues.list.useQuery();

  const teamOptions = useMemo(() => {
    return (
      teams?.map((team) => ({
        value: team.id,
        label: team.name,
      })) || []
    );
  }, [teams]);

  const leagueOptions = useMemo(() => {
    return (
      leagues?.map((league) => ({
        value: league.id,
        label: league.name,
      })) || []
    );
  }, [leagues]);

  const createMatch = trpc.matches.create.useMutation({
    onSuccess: (data) => {
      toast.success(`Match created successfully!`);
      router.push("/dashboard/matches");
      router.refresh();
    },
    onError: (error) =>
      toast.error("Failed to create match", {
        description: error.message,
      }),
  });

  const updateMatch = trpc.matches.update.useMutation({
    onSuccess: (data) => {
      toast.success(`Match updated successfully!`);
      router.push("/dashboard/matches");
      router.refresh();
    },
    onError: (error) =>
      toast.error("Failed to update match", {
        description: error.message,
      }),
  });

  function onSubmit(data: MatchFormValues) {
    if (isEditMode && initialData) {
      updateMatch.mutate({ id: initialData.id, ...data });
    } else {
      createMatch.mutate(data);
    }
  }

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>{isEditMode ? "Edit Match" : "Create New Match"}</CardTitle>
          <CardDescription>
            {isEditMode
              ? "Update the match details."
              : "Fill in the details to create a new match."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField
                  name="homeTeamId"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Home Team</FormLabel>
                      <Combobox
                        options={teamOptions}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select a team..."
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="awayTeamId"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Away Team</FormLabel>
                      <Combobox
                        options={teamOptions}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select a team..."
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                name="leagueId"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>League</FormLabel>
                    <Combobox
                      options={leagueOptions}
                      value={field.value || ""}
                      onChange={field.onChange}
                      placeholder="Select a league..."
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="kickoffAt"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kickoff At</FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        value={format(field.value, "yyyy-MM-dd'T'HH:mm")}
                        onChange={(e) => field.onChange(new Date(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="status"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(MatchStatus).map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField
                  control={form.control}
                  name="scoreHome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Home Score</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          {...{ ...field, onChange: undefined }}
                          value={field.value || ""}
                          onChange={(event) => {
                            const valueAsString = event.target.value;
                            field.onChange(
                              valueAsString === "" ? undefined : +valueAsString
                            );
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="scoreAway"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Away Score</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          {...{ ...field, onChange: undefined }}
                          value={field.value || ""}
                          onChange={(event) => {
                            const valueAsString = event.target.value;
                            field.onChange(
                              valueAsString === "" ? undefined : +valueAsString
                            );
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button
                type="submit"
                disabled={createMatch.isPending || updateMatch.isPending}
                className="w-full sm:w-auto"
              >
                {isEditMode
                  ? updateMatch.isPending
                    ? "Saving..."
                    : "Save changes"
                  : createMatch.isPending
                  ? "Creating..."
                  : "Create Match"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
