"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Trash } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { trpc } from "@/lib/trpc/client";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

type DeleteLeagueActionProps = {
  leagueId: string;
  leagueName: string;
};

export default function DeleteLeagueAction({ leagueId, leagueName }: DeleteLeagueActionProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const del = trpc.leagues.delete.useMutation({
    onSuccess: () => {
      toast.success(`League "${leagueName}" deleted successfully!`);
      router.refresh();
      setOpen(false);
    },
    onError: (error) => {
      toast.error("Failed to delete league", { description: error.message });
      setOpen(false);
    },
  });

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600">
          <Trash className="mr-2 h-4 w-4" />
          <span>Delete</span>
        </DropdownMenuItem>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the league &quot;{leagueName}&quot;. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => del.mutate({ id: leagueId })}
            disabled={del.isPending}
            className="bg-red-600 hover:bg-red-700"
          >
            {del.isPending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
