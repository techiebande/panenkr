
"use client";

import { MatchWithTeams } from "@/features/matches/match.router";
import { Combobox } from "@/components/ui/combobox";
import Image from "next/image";
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
import { useMemo, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { MatchStatus } from "@prisma/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { parseDateTimeLocal, formatDateTimeLocal } from "@/lib/datetime-utils";

type MatchFormValues = z.infer<typeof createMatchSchema>;

type MatchFormProps = {
  initialData?: MatchWithTeams | null;
};

function CrestSelect({
  value,
  onChange,
  options,
  placeholder,
}: {
  value?: string
  onChange: (v: string) => void
  options: { value: string; label: string; filename: string }[]
  placeholder?: string
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  // Lightweight client-side filter
  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return options.filter(o => o.label.toLowerCase().includes(q) || o.filename.toLowerCase().includes(q));
  }, [options, query]);

  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen(o => !o)} className="h-10 rounded border px-3 text-sm">
        {value ? value.split("/").pop() : (placeholder || "Select crest")}
      </button>
      {open && (
        <div className="absolute z-50 mt-2 w-72 max-h-80 overflow-auto rounded border bg-background p-2 shadow">
          <input
            className="mb-2 w-full rounded border px-2 py-1 text-sm"
            placeholder="Search crest..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <ul className="space-y-1">
            {filtered.map((opt) => (
              <li key={opt.value}>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded px-2 py-1 hover:bg-muted"
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                >
                  <Image src={opt.value} alt={opt.label} width={20} height={20} className="rounded" />
                  <span className="truncate text-left text-sm">{opt.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function MatchForm({ initialData }: MatchFormProps) {
  const router = useRouter();
  const isEditMode = !!initialData;

  const form = useForm<MatchFormValues>({
    resolver: zodResolver(createMatchSchema),
    defaultValues: initialData
      ? {
          homeTeamId: initialData.homeTeamId,
          awayTeamId: initialData.awayTeamId,
          leagueId: initialData.leagueId || undefined,
          kickoffAt: initialData.kickoffAt instanceof Date 
            ? initialData.kickoffAt 
            : new Date(initialData.kickoffAt),
          status: initialData.status,
          scoreHome: initialData.scoreHome || undefined,
          scoreAway: initialData.scoreAway || undefined,
        }
      : {
          homeTeamId: "",
          awayTeamId: "",
          leagueId: "",
          // Default to current date/time for new matches
          kickoffAt: new Date(),
          status: MatchStatus.SCHEDULED,
          scoreHome: undefined,
          scoreAway: undefined,
        },
    mode: "onChange",
  });

  const { data: teams } = trpc.teams.list.useQuery();
  const { data: leagues } = trpc.leagues.list.useQuery();
  const { data: crestOptions } = trpc.teams.listCrests.useQuery();
  const utils = trpc.useUtils();

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

  const updateTeamCrestMutation = trpc.teams.updateCrest.useMutation({
    onSuccess: () => {
      utils.teams.list.invalidate();
    },
  });
  const updateTeamCrest = updateTeamCrestMutation.mutate;

  const createMatch = trpc.matches.create.useMutation({
    onSuccess: () => {
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
    onSuccess: () => {
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
                {/* Crest pickers for quick visual confirmation */}
                <div className="grid grid-cols-2 gap-4">
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
                        {crestOptions && (
                          <div className="mt-2 flex items-center gap-3">
                            <CrestSelect
                              value={teams?.find(t => t.id === field.value)?.crestUrl || ""}
                              onChange={(url) => {
                                const id = field.value;
                                if (!id) return;
                                // optimistic UI not necessary, just fire-and-forget
                                updateTeamCrest({ teamId: id, crestUrl: url });
                              }}
                              options={crestOptions}
                              placeholder="Crest"
                            />
                            {teams?.find(t => t.id === field.value)?.crestUrl && (
                              <Image
                                src={teams!.find(t => t.id === field.value)!.crestUrl!}
                                alt="Home crest"
                                width={28}
                                height={28}
                                className="rounded"
                              />
                            )}
                          </div>
                        )}
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
                        {crestOptions && (
                          <div className="mt-2 flex items-center gap-3">
                            <CrestSelect
                              value={teams?.find(t => t.id === field.value)?.crestUrl || ""}
                              onChange={(url) => {
                                const id = field.value;
                                if (!id) return;
                                updateTeamCrest({ teamId: id, crestUrl: url });
                              }}
                              options={crestOptions}
                              placeholder="Crest"
                            />
                            {teams?.find(t => t.id === field.value)?.crestUrl && (
                              <Image
                                src={teams!.find(t => t.id === field.value)!.crestUrl!}
                                alt="Away crest"
                                width={28}
                                height={28}
                                className="rounded"
                              />
                            )}
                          </div>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
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
                        value={formatDateTimeLocal(field.value)}
                        onChange={(e) => field.onChange(parseDateTimeLocal(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter the exact date and time (e.g., &quot;2nd January 2025, 14:00&quot; will be stored exactly as entered)
                    </FormDescription>
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
                          value={field.value ?? ""}
                          onChange={(event) => {
                            const valueAsString = event.target.value;
                            field.onChange(
                              valueAsString === "" ? null : +valueAsString
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
                          value={field.value ?? ""}
                          onChange={(event) => {
                            const valueAsString = event.target.value;
                            field.onChange(
                              valueAsString === "" ? null : +valueAsString
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
