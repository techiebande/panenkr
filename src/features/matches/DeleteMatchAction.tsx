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

type DeleteMatchActionProps = {
  matchId: string;
  matchTitle: string;
};

export default function DeleteMatchAction({ matchId, matchTitle }: DeleteMatchActionProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const deleteMatch = trpc.matches.delete.useMutation({
    onSuccess: () => {
      toast.success(`Match "${matchTitle}" deleted successfully!`);
      router.refresh();
      setOpen(false);
    },
    onError: (error) => {
      toast.error("Failed to delete match", {
        description: error.message,
      });
      setOpen(false);
    },
  });

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <DropdownMenuItem
          onSelect={(e) => e.preventDefault()}
          className="text-red-600"
        >
          <Trash className="mr-2 h-4 w-4" />
          <span>Delete</span>
        </DropdownMenuItem>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the match &quot;{matchTitle}&quot;. This action
            cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => deleteMatch.mutate({ id: matchId })}
            disabled={deleteMatch.isPending}
            className="bg-red-600 hover:bg-red-700"
          >
            {deleteMatch.isPending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
