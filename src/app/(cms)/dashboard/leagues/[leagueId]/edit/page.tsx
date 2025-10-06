import { appRouter } from "@/lib/trpc/root";
import { createTRPCContext } from "@/lib/trpc/server";
import LeagueForm from "@/features/leagues/LeagueForm";

export default async function EditLeaguePage({ params }: { params: Promise<{ leagueId: string }> }) {
  const { leagueId } = await params;

  const serverContext = await createTRPCContext();
  const serverCaller = appRouter.createCaller(serverContext);
  const league = await serverCaller.leagues.getById({ id: leagueId });

  return <LeagueForm initialData={league} />;
}
