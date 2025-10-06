"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMemo, useState } from "react";

import { trpc } from "@/lib/trpc/client";
import { createTeamSchema, CreateTeamInput } from "./team.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";

export type TeamWithLeague = {
  id: string;
  name: string;
  shortName: string | null;
  crestUrl: string | null;
  leagueId: string | null;
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

export default function TeamForm({ initialData }: { initialData?: TeamWithLeague | null }) {
  const router = useRouter();
  const isEditMode = !!initialData;

  const form = useForm<CreateTeamInput>({
    resolver: zodResolver(createTeamSchema),
    defaultValues: initialData ? {
      name: initialData.name,
      shortName: initialData.shortName || "",
      leagueId: initialData.leagueId || "",
      crestUrl: initialData.crestUrl || "",
      externalId: "",
    } : {
      name: "",
      shortName: "",
      leagueId: "",
      crestUrl: "",
      externalId: "",
    },
    mode: "onChange",
  });

  const { data: leagues } = trpc.leagues.list.useQuery();
  const leagueOptions = useMemo(() => (leagues || []).map(l => ({ value: l.id, label: l.name })), [leagues]);
  const { data: crestOptions } = trpc.teams.listCrests.useQuery();

  const createTeam = trpc.teams.create.useMutation({
    onSuccess: () => {
      router.push("/dashboard/teams");
      router.refresh();
    },
  });
  const updateTeam = trpc.teams.update.useMutation({
    onSuccess: () => {
      router.push("/dashboard/teams");
      router.refresh();
    },
  });

  function onSubmit(data: CreateTeamInput) {
    if (isEditMode && initialData) {
      // @ts-ignore - server expects update shape; CreateTeamInput is compatible for our fields
      updateTeam.mutate({ id: initialData.id, ...data });
    } else {
      createTeam.mutate(data);
    }
  }

  return (
    <div className="p-4 sm:p-8 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>{isEditMode ? "Edit Team" : "Create Team"}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                name="name"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Arsenal" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="shortName"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Short Name (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., ARS" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="leagueId"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>League</FormLabel>
                    <Select value={field.value || ""} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a league" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {leagueOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="crestUrl"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Crest</FormLabel>
                    {Array.isArray(crestOptions) && crestOptions.length > 0 ? (
                      <div className="flex items-center gap-3">
                        <CrestSelect
                          value={field.value || ""}
                          onChange={field.onChange}
                          options={crestOptions}
                          placeholder="Select team crest"
                        />
                        {field.value && (
                          <Image src={field.value} alt="crest" width={28} height={28} className="rounded" />
                        )}
                      </div>
                    ) : (
                      <FormControl>
                        <Input placeholder="/crests/team.svg" {...field} />
                      </FormControl>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button type="submit">{isEditMode ? "Save Changes" : "Create Team"}</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
