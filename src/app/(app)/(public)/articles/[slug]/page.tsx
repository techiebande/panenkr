import { appRouter } from '@/lib/trpc/root';
import { createTRPCContext } from '@/lib/trpc/server';
import Image from 'next/image';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import TiptapRenderer from '@/components/TiptapRenderer';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon } from 'lucide-react';

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const context = await createTRPCContext();
  const caller = appRouter.createCaller(context);
  const article = await caller.articles.getBySlug({ slug: params.slug });

  const formattedDate = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(article.publishedAt ? new Date(article.publishedAt) : new Date());

  return (
    <div className="bg-background text-foreground min-h-screen">
      <div className="container mx-auto px-4 py-16 sm:py-24">
        <div className="max-w-3xl mx-auto">
            <div className="mb-8">
                <Link href="/articles">
                    <Button variant="outline">
                        <ArrowLeftIcon className="mr-2 h-4 w-4" />
                        Back to Articles
                    </Button>
                </Link>
            </div>
          <main>
            <article>
              <header className="mb-8">
                <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl mb-4">{article.title}</h1>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={article.author.image || undefined} alt={article.author.name || "Author"} />
                      <AvatarFallback>{article.author.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{article.author.name}</p>
                      <p className="text-xs text-muted-foreground">{formattedDate}</p>
                    </div>
                  </div>
                </div>
              </header>

              {article.featuredImage && (
                <div className="relative h-96 w-full mb-8 rounded-lg overflow-hidden">
                  <Image
                    src={article.featuredImage.url}
                    alt={article.featuredImage.altText || article.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              <div className="prose prose-lg dark:prose-invert max-w-none">
                <TiptapRenderer content={article.content as string} />
              </div>
            </article>
          </main>
        </div>
      </div>
    </div>
  );
}
