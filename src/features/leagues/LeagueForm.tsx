"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { trpc } from "@/lib/trpc/client";
import { createLeagueSchema, CreateLeagueInput, UpdateLeagueInput } from "./league.schema";
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

export type League = {
  id: string;
  name: string;
  country: string | null;
};

export default function LeagueForm({ initialData }: { initialData?: League | null }) {
  const router = useRouter();
  const isEditMode = !!initialData;

  const form = useForm<CreateLeagueInput>({
    resolver: zodResolver(createLeagueSchema),
    defaultValues: initialData ? {
      name: initialData.name,
      country: initialData.country || "",
    } : {
      name: "",
      country: "",
    },
    mode: "onChange",
  });

  const createLeague = trpc.leagues.create.useMutation({
    onSuccess: () => {
      router.push("/dashboard/leagues");
      router.refresh();
    },
  });
  const updateLeague = trpc.leagues.update.useMutation({
    onSuccess: () => {
      router.push("/dashboard/leagues");
      router.refresh();
    },
  });

  function onSubmit(data: CreateLeagueInput) {
    if (isEditMode && initialData) {
      const payload: UpdateLeagueInput = { id: initialData.id, ...data };
      updateLeague.mutate(payload);
    } else {
      createLeague.mutate(data);
    }
  }

  return (
    <div className="p-4 sm:p-8 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>{isEditMode ? "Edit League" : "Create League"}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                name="name"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>League Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Premier League" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="country"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., England" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button type="submit">{isEditMode ? "Save Changes" : "Create League"}</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
