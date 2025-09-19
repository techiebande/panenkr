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
import { Edit, MoreVertical, Plus } from "lucide-react";

import { appRouter } from "@/lib/trpc/root";
import { createTRPCContext } from "@/lib/trpc/server";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default async function ArticlesPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  if (session.user.role !== "ADMIN" && session.user.role !== "EDITOR") {
    return (
      <div className="p-4 sm:p-8">
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-gray-600">You don&apos;t have permission to manage articles.</p>
      </div>
    );
  }

  const serverContext = await createTRPCContext();
  const serverCaller = appRouter.createCaller(serverContext);

  const { articles } = await serverCaller.articles.list();

  return (
    <div className="p-4 sm:p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Articles</h1>
          <p className="text-muted-foreground">Manage your articles and blog posts.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/articles/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Article
          </Link>
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">Title</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {articles && articles.length > 0 ? (
              articles.map((article) => (
                <TableRow key={article.id}>
                  <TableCell className="font-medium">
                    <div>
                      <p className="font-medium">{article.title}</p>
                      {article.publishedAt && (
                        <p className="text-xs text-muted-foreground">
                          Published {format(new Date(article.publishedAt), "MMM d, yyyy")}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{article.author.name || article.author.email}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        article.publishStatus === "PUBLISHED"
                          ? "default"
                          : article.publishStatus === "DRAFT"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {article.publishStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {article.tags.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {article.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag.id} variant="outline" className="text-xs">
                            {tag.name}
                          </Badge>
                        ))}
                        {article.tags.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{article.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">No tags</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {format(new Date(article.createdAt), "MMM d, yyyy")}
                  </TableCell>
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
                          <Link href={`/dashboard/articles/${article.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Edit</span>
                          </Link>
                        </DropdownMenuItem>
                        {article.publishStatus === "PUBLISHED" && (
                          <DropdownMenuItem asChild>
                            <Link href={`/articles/${article.slug}`} target="_blank">
                              View Article
                            </Link>
                          </DropdownMenuItem>
                        )}
                        {/* We'll add delete functionality later */}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24">
                  <div className="flex flex-col items-center justify-center">
                    <p className="text-muted-foreground mb-2">No articles found.</p>
                    <Button asChild variant="outline" size="sm">
                      <Link href="/dashboard/articles/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Create your first article
                      </Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}