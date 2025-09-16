import ArticleForm from "@/features/articles/ArticleForm";
import { appRouter } from "@/lib/trpc/root";
import { createTRPCContext } from "@/lib/trpc/server";

type EditArticlePageProps = {
  params: Promise<{
    articleId: string;
  }>;
};

export default async function EditArticlePage({
  params,
}: EditArticlePageProps) {
  const { articleId } = await params;

  const serverContext = await createTRPCContext();
  const serverCaller = appRouter.createCaller(serverContext);

  const article = await serverCaller.articles.getById({
    id: articleId,
  });

  return <ArticleForm initialData={article} />;
}