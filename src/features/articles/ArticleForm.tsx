"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PublishStatus } from "@prisma/client";
import { JsonValue } from "@prisma/client/runtime/library";
import { toast } from "sonner";
import { useState } from "react";

import { trpc } from "@/lib/trpc/client";
import { createArticleSchema, CreateArticleInput } from "./article.schema";
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
import TiptapEditor from "@/components/TiptapEditor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";

type ArticleWithDetails = {
  id: string;
  title: string;
  content: JsonValue;
  featuredImageId: string | null;
  publishStatus: PublishStatus;
  tags: Array<{ id: string; name: string; slug: string }>;
};

type ArticleFormProps = {
  initialData?: ArticleWithDetails | null;
};

export default function ArticleForm({ initialData }: ArticleFormProps) {
  const router = useRouter();
  const isEditMode = !!initialData;
  const [tagInput, setTagInput] = useState("");

  const form = useForm<CreateArticleInput>({
    resolver: zodResolver(createArticleSchema),
    defaultValues: initialData
      ? {
          title: initialData.title,
          content: String(initialData.content || ""),
          featuredImageId: initialData.featuredImageId || undefined,
          publishStatus: initialData.publishStatus,
          tags: initialData.tags.map(tag => tag.name),
        }
      : {
          title: "",
          content: "",
          featuredImageId: undefined,
          publishStatus: PublishStatus.DRAFT,
          tags: [],
        },
    mode: "onChange",
  });

  const watchedTags = form.watch("tags") || [];

  const createArticle = trpc.articles.create.useMutation({
    onSuccess: (data) => {
      toast.success(`Article "${data?.title}" created successfully!`);
      router.push("/dashboard/articles");
      router.refresh();
    },
    onError: (error) =>
      toast.error("Failed to create article", {
        description: error.message,
      }),
  });

  const updateArticle = trpc.articles.update.useMutation({
    onSuccess: (data) => {
      toast.success(`Article "${data?.title}" updated successfully!`);
      router.push("/dashboard/articles");
      router.refresh();
    },
    onError: (error) =>
      toast.error("Failed to update article", {
        description: error.message,
      }),
  });

  function onSubmit(data: CreateArticleInput) {
    if (isEditMode && initialData) {
      updateArticle.mutate({ id: initialData.id, ...data });
    } else {
      createArticle.mutate(data);
    }
  }

  const addTag = () => {
    if (tagInput.trim() && !watchedTags.includes(tagInput.trim())) {
      form.setValue("tags", [...watchedTags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    form.setValue("tags", watchedTags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>
            {isEditMode ? "Edit Article" : "Create New Article"}
          </CardTitle>
          <CardDescription>
            {isEditMode
              ? "Update your article content and settings."
              : "Create a new article for your football predictions platform."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Title */}
              <FormField
                name="title"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Article Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Top 5 Premier League Predictions This Weekend"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Content */}
              <FormField
                name="content"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Article Content</FormLabel>
                    <FormControl>
                      <TiptapEditor
                        value={(field.value as string) || ""}
                        onChange={(html) => field.onChange(html)}
                        placeholder="Write your article content here..."
                      />
                    </FormControl>
                    <FormDescription>
                      Use the toolbar to format your article. Content is saved as HTML and sanitized when rendered.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Tags */}
              <FormField
                name="tags"
                control={form.control}
                render={() => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <div className="space-y-2">
                      {watchedTags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {watchedTags.map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="flex items-center gap-1"
                            >
                              {tag}
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-auto p-0 ml-1 hover:bg-transparent"
                                onClick={() => removeTag(tag)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </Badge>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add a tag..."
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyPress={handleKeyPress}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addTag}
                          disabled={!tagInput.trim()}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <FormDescription>
                      Add relevant tags to help categorize your article.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Publish Status */}
              <FormField
                name="publishStatus"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Publication Status</FormLabel>
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
                        <SelectItem value={PublishStatus.DRAFT}>
                          Draft - Not visible to public
                        </SelectItem>
                        <SelectItem value={PublishStatus.PUBLISHED}>
                          Published - Live on website
                        </SelectItem>
                        <SelectItem value={PublishStatus.ARCHIVED}>
                          Archived - Hidden from public
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Choose whether this article should be visible to the public.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Actions */}
              <div className="flex gap-4 pt-6">
                <Button
                  type="submit"
                  disabled={
                    createArticle.isPending || updateArticle.isPending
                  }
                  className="w-full sm:w-auto"
                >
                  {isEditMode
                    ? updateArticle.isPending
                      ? "Saving..."
                      : "Save Changes"
                    : createArticle.isPending
                    ? "Creating..."
                    : "Create Article"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/dashboard/articles")}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}