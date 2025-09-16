
import { appRouter } from "@/lib/trpc/root";
import { createTRPCContext } from "@/lib/trpc/server";
import MatchForm from "@/features/matches/MatchForm";
import { notFound } from "next/navigation";

type EditMatchPageProps = {
  params: {
    matchId: string;
  };
};

export default async function EditMatchPage({ params }: EditMatchPageProps) {
  const serverContext = await createTRPCContext();
  const serverCaller = appRouter.createCaller(serverContext);
  const match = await serverCaller.matches.getById({ id: params.matchId });

  if (!match) {
    notFound();
  }

  return <MatchForm initialData={match} />;
}
