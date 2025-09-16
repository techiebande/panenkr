
import { appRouter } from "@/lib/trpc/root";
import { createTRPCContext } from "@/lib/trpc/server";
import { Suspense } from "react";
import { format } from "date-fns";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function MatchesPage() {
  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Matches</CardTitle>
          <Button asChild>
            <Link href="/dashboard/matches/new">New Match</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<p>Loading matches...</p>}>
            <MatchesList />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}

import { MoreVertical, Edit } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DeleteMatchAction from "@/features/matches/DeleteMatchAction";

async function MatchesList() {
  const serverContext = await createTRPCContext();
  const serverCaller = appRouter.createCaller(serverContext);
  const matches = await serverCaller.matches.list();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Match</TableHead>
          <TableHead>Kickoff</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Home Score</TableHead>
          <TableHead>Away Score</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {matches.map((match) => (
          <TableRow key={match.id}>
            <TableCell>
              {match.homeTeam.name} vs {match.awayTeam.name}
            </TableCell>
            <TableCell>
              {format(new Date(match.kickoffAt), "dd-MM-yyyy HH:mm")}
            </TableCell>
            <TableCell>{match.status}</TableCell>
            <TableCell>{match.scoreHome ?? '-'}</TableCell>
            <TableCell>{match.scoreAway ?? '-'}</TableCell>
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
                    <Link href={`/dashboard/matches/${match.id}/edit`}>
                      <Edit className="mr-2 h-4 w-4" />
                      <span>Edit</span>
                    </Link>
                  </DropdownMenuItem>
                  <DeleteMatchAction
                    matchId={match.id}
                    matchTitle={`${match.homeTeam.name} vs ${match.awayTeam.name}`}
                  />
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
