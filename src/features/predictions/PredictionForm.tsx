"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PredictionType } from "@prisma/client";
import { toast } from "sonner";
import { z } from "zod";
import { format } from "date-fns";
import { useEffect, useState, useMemo } from "react";

import { trpc } from "@/lib/trpc/client";
import { createPredictionSchema } from "@/features/predictions/prediction.schema";
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
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Combobox } from "@/components/ui/combobox";
import { PredictionWithMatch } from "@/lib/trpc/types";
import TiptapEditor from "@/components/TiptapEditor";

type PredictionFormValues = z.infer<typeof createPredictionSchema>;

const useClientDateFormatter = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const formatDate = (date: Date | string) => {
    if (!isClient) {
      return "Loading...";
    }

    try {
      // Convert to local timezone automatically
      const localDate = typeof date === "string" ? new Date(date) : date;
      return format(localDate, "dd-MM-yyyy HH:mm");
    } catch (error) {
      console.warn("Date formatting error:", error);
      return "Invalid date";
    }
  };

  return { formatDate, isClient };
};

type PredictionFormProps = {
  initialData?: PredictionWithMatch | null;
};

const predictionValueOptions = {
  ONE_X_TWO: [
    { value: "1", label: "Home Win (1)" },
    { value: "X", label: "Draw (X)" },
    { value: "2", label: "Away Win (2)" },
  ],
  OVER_UNDER: [
    { value: "Over 0.5", label: "Over 0.5" },
    { value: "Under 0.5", label: "Under 0.5" },
    { value: "Over 1.5", label: "Over 1.5" },
    { value: "Under 1.5", label: "Under 1.5" },
    { value: "Over 2.5", label: "Over 2.5" },
    { value: "Under 2.5", label: "Under 2.5" },
  ],
  BTTS: [
    { value: "Yes", label: "Yes (Both Teams to Score)" },
    { value: "No", label: "No (One or Neither Team to Score)" },
  ],
  HT_FT: [],
  CUSTOM: [],
};

export default function PredictionForm({ initialData }: PredictionFormProps) {
  const router = useRouter();
  const isEditMode = !!initialData;
  const { formatDate, isClient } = useClientDateFormatter();

  const form = useForm<PredictionFormValues>({
    resolver: zodResolver(createPredictionSchema),
    defaultValues: initialData
      ? {
          title: initialData.title,
          matchId: initialData.matchId,
          type: initialData.type as PredictionType,
          value: initialData.value,
          confidence: initialData.confidence,
          isPremium: initialData.isPremium,
          content: typeof initialData.content === 'string' ? initialData.content : JSON.stringify(initialData.content || ''),
          summary: (initialData as unknown as { summary?: string }).summary || '',
          teamNewsHome: (initialData as unknown as { teamNewsHome?: string }).teamNewsHome || '',
          teamNewsAway: (initialData as unknown as { teamNewsAway?: string }).teamNewsAway || '',
        }
      : {
          title: "",
          matchId: "",
          type: PredictionType.ONE_X_TWO,
          value: "",
          confidence: 5,
          isPremium: false,
          content: {},
          summary: "",
          teamNewsHome: "",
          teamNewsAway: "",
        },
    mode: "onChange",
  });

  const predictionType = form.watch("type");

  const { data: searchedMatches } = trpc.matches.search.useQuery({ query: "" });

  const matchOptions = useMemo(() => {
    const options = new Map<string, { value: string; label: string }>();

    // Always add the initial match first if in edit mode
    if (isEditMode && initialData?.match) {
      const match = initialData.match;
      options.set(match.id, {
        value: match.id,
        label: `${match.homeTeam.name} vs ${match.awayTeam.name} (${formatDate(
          new Date(match.kickoffAt)
        )})`,
      });
    }

    // Add searched matches
    searchedMatches?.forEach((match) => {
      if (!options.has(match.id)) {
        options.set(match.id, {
          value: match.id,
          label: `${match.homeTeam.name} vs ${
            match.awayTeam.name
          } (${formatDate(new Date(match.kickoffAt))})`,
        });
      }
    });

    return Array.from(options.values());
  }, [initialData, isEditMode, searchedMatches, formatDate]);

  const createPrediction = trpc.predictions.create.useMutation({
    onSuccess: (data) => {
      toast.success(`Prediction "${data?.title}" created successfully!`);
      router.push("/dashboard");
      router.refresh();
    },
    onError: (error) =>
      toast.error("Failed to create prediction", {
        description: error.message,
      }),
  });

  const updatePrediction = trpc.predictions.update.useMutation({
    onSuccess: (data) => {
      toast.success(`Prediction "${data?.title}" updated successfully!`);
      router.push("/dashboard");
      router.refresh();
    },
    onError: (error) =>
      toast.error("Failed to update prediction", {
        description: error.message,
      }),
  });

  function onSubmit(data: PredictionFormValues) {
    if (isEditMode && initialData) {
      updatePrediction.mutate({ id: initialData.id, ...data });
    } else {
      createPrediction.mutate(data);
    }
  }

  // Don't render the form until client-side hydration is complete
  // This prevents the combobox options from having hydration mismatches
  if (!isClient) {
    return (
      <div className="p-4 sm:p-8 max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Create New Prediction</CardTitle>
            <CardDescription>
              Fill in the details to create a new football prediction.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              <div className="h-10 bg-muted animate-pulse rounded-md"></div>
              <div className="h-10 bg-muted animate-pulse rounded-md"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="h-10 bg-muted animate-pulse rounded-md"></div>
                <div className="h-10 bg-muted animate-pulse rounded-md"></div>
              </div>
              <div className="h-10 bg-muted animate-pulse rounded-md"></div>
              <div className="h-20 bg-muted animate-pulse rounded-md"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>
            {isEditMode ? "Edit Prediction" : "Create New Prediction"}
          </CardTitle>
          <CardDescription>
            {isEditMode
              ? "Update your prediction details."
              : "Fill in the details to create a new football prediction."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                name="title"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Man City to dominate Arsenal"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="matchId"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Match</FormLabel>
                    <Combobox
                      options={matchOptions}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select a match..."
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField
                  name="type"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prediction Type</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          form.setValue("value", "");
                        }}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(PredictionType).map((type) => (
                            <SelectItem
                              key={type}
                              value={type}
                              disabled={type === "HT_FT"}
                            >
                              {type.replace("_", "/")}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* --- CONDITIONAL FIELD FOR PREDICTION VALUE --- */}
                {predictionType === "CUSTOM" ? (
                  <FormField
                    name="value"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Custom Prediction Value</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., 'Correct Score 2-1'"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : (
                  <FormField
                    name="value"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prediction Value</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a value..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {predictionValueOptions[predictionType]?.map(
                              (option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <FormField
                control={form.control}
                name="confidence"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confidence (1-10)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="5"
                        {...{ ...field, onChange: undefined }}
                        value={field.value || ""}
                        onChange={(event) => {
                          const valueAsString = event.target.value;
                          field.onChange(
                            valueAsString === "" ? 0 : +valueAsString
                          );
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="summary"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prediction Summary</FormLabel>
                    <FormDescription>Short explanation that appears on the public page.</FormDescription>
                    <FormControl>
                      {/* Rich text editor (Tiptap) */}
                      <TiptapEditor
                        value={field.value || ""}
                        onChange={(html) => field.onChange(html)}
                        placeholder="Write a short summary..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField
                  name="teamNewsHome"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Home Team News</FormLabel>
                      <FormControl>
                        <TiptapEditor
                          value={field.value || ""}
                          onChange={(html) => field.onChange(html)}
                          placeholder="Home team news: injuries, rotations, tactical notes..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="teamNewsAway"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Away Team News</FormLabel>
                      <FormControl>
                        <TiptapEditor
                          value={field.value || ""}
                          onChange={(html) => field.onChange(html)}
                          placeholder="Away team news: injuries, rotations, tactical notes..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                name="isPremium"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Premium Prediction</FormLabel>
                      <FormDescription>
                        Only subscribed users will be able to see this
                        prediction.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={
                  createPrediction.isPending || updatePrediction.isPending
                }
                className="w-full sm:w-auto"
              >
                {isEditMode
                  ? updatePrediction.isPending
                    ? "Saving..."
                    : "Save changes"
                  : createPrediction.isPending
                  ? "Creating..."
                  : "Create Prediction"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
