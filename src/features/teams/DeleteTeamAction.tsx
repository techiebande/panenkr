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

type DeleteTeamActionProps = {
  teamId: string;
  teamName: string;
};

export default function DeleteTeamAction({ teamId, teamName }: DeleteTeamActionProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const del = trpc.teams.delete.useMutation({
    onSuccess: () => {
      toast.success(`Team "${teamName}" deleted successfully!`);
      router.refresh();
      setOpen(false);
    },
    onError: (error) => {
      toast.error("Failed to delete team", { description: error.message });
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
            This will permanently delete the team &quot;{teamName}&quot;. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => del.mutate({ id: teamId })}
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
