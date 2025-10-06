import { appRouter } from "@/lib/trpc/root";
import { createTRPCContext } from "@/lib/trpc/server";
import TeamForm from "@/features/teams/TeamForm";

export default async function EditTeamPage({ params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = await params;

  const serverContext = await createTRPCContext();
  const serverCaller = appRouter.createCaller(serverContext);
  const team = await serverCaller.teams.getById({ id: teamId });

  return <TeamForm initialData={team} />;
}
