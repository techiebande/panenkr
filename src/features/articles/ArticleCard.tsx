import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { inferRouterOutputs } from "@trpc/server";
import { appRouter } from "@/lib/trpc/root";
import Image from "next/image";

type Article = inferRouterOutputs<typeof appRouter>["articles"]["getRecent"][0];

interface ArticleCardProps {
  article: Article;
}

const ArticleCard = ({ article }: ArticleCardProps) => {
  const { title, slug, featuredImage, author, publishedAt } = article;

  const formattedDate = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(publishedAt ? new Date(publishedAt) : new Date());

  return (
    <Link href={`/article/${slug}`} className="block group">
<Card className="overflow-hidden transition-all duration-300 ease-in-out hover:shadow-md hover:-translate-y-0.5">
        <CardHeader className="p-0">
          <div className="relative h-48 w-full">
            <Image
              src={featuredImage?.url || "/placeholder.svg"}
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
            <Avatar className="h-8 w-8">
              <AvatarImage src={author.image || undefined} alt={author.name || "Author"} />
              <AvatarFallback>{author.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
<p className="text-sm font-medium">{author.name}</p>
              <p className="text-xs text-muted-foreground">{formattedDate}</p>
            </div>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default ArticleCard;
