"use client";

import { trpc } from "@/lib/trpc/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
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
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Trash2 } from "lucide-react";

type DeletePredictionsActionProps = {
  predictionId: string;
  predictionTitle: string;
};

export default function DeletePredictionsAction({
  predictionId,
  predictionTitle,
}: DeletePredictionsActionProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);

  const deletePrediction = trpc.predictions.delete.useMutation({
    onSuccess: () => {
      toast.success(`Prediction ${predictionTitle} deleted successfully`);
      router.refresh();
      setDialogOpen(false);
    },
    onError: (error) => {
      toast.error("Failed to delete prediction", {
        description: error.message,
      });
    },
  });

  const handleDelete = () => {
    deletePrediction.mutate({ id: predictionId });
  };

  return (
    <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <AlertDialogTrigger asChild>
        <DropdownMenuItem
          className="text-red-600 focus:text-red-600"
          onSelect={(e) => e.preventDefault()} // Prevents the dropdown from closing
        >
          <Trash2 className="mr-2 h-4 w-4" />
          <span>Delete</span>
        </DropdownMenuItem>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the
            prediction
            <span className="font-bold"> "{predictionTitle}"</span>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-white hover:bg-destructive/90"
            disabled={deletePrediction.isPending}
          >
            {deletePrediction.isPending ? "Deleting..." : "Yes, delete it"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
