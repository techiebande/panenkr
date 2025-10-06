import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
// removed author avatar display
import { inferRouterOutputs } from "@trpc/server";
import { appRouter } from "@/lib/trpc/root";
import Image from "next/image";

type Article = inferRouterOutputs<typeof appRouter>["articles"]["getPublished"]["articles"][0] | inferRouterOutputs<typeof appRouter>["articles"]["getRecent"][0];

interface ArticleCardProps {
  article: Article;
}

function extractFirstImageSrc(article: any): string | undefined {
  try {
    const html = String(article?.content || "");
    const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
    return match?.[1];
  } catch {
    return undefined;
  }
}

const ArticleCard = ({ article }: ArticleCardProps) => {
  const { title, slug, featuredImage, publishedAt } = article as any;

  const formattedDate = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(publishedAt ? new Date(publishedAt) : new Date());

  return (
    <Link href={`/articles/${slug}`} className="block group">
<Card className="overflow-hidden transition-all duration-300 ease-in-out hover:shadow-md hover:-translate-y-0.5">
        <CardHeader className="p-0">
          <div className="relative h-48 w-full">
            <Image
              src={(featuredImage?.url) || extractFirstImageSrc(article as any) || "/placeholder.svg"}
              alt={featuredImage?.altText || title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        </CardHeader>
        <CardContent className="p-4">
<CardTitle className="text-base sm:text-lg font-semibold leading-snug group-hover:text-foreground/80 transition-colors">
            {title}
          </CardTitle>
        </CardContent>
        <CardFooter className="p-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <p className="text-xs text-muted-foreground">{formattedDate}</p>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default ArticleCard;
