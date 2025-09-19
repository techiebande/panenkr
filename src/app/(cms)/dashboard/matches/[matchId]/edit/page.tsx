
import { appRouter } from "@/lib/trpc/root";
import { createTRPCContext } from "@/lib/trpc/server";
import MatchForm from "@/features/matches/MatchForm";
import { notFound } from "next/navigation";

type EditMatchPageProps = {
  params: Promise<{
    matchId: string;
  }>;
};

export default async function EditMatchPage({ params }: EditMatchPageProps) {
  const { matchId } = await params;
  const serverContext = await createTRPCContext();
  const serverCaller = appRouter.createCaller(serverContext);
  const match = await serverCaller.matches.getById({ id: matchId });

  if (!match) {
    notFound();
  }

  return <MatchForm initialData={match} />;
}
