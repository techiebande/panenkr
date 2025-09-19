"use client";

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { trpc } from "@/lib/trpc/client";
import { PublishStatus } from "@prisma/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

type PublishPredictionActionProps = {
  predictionId: string;
  currentStatus: PublishStatus;
};

export default function PublishPredictionAction({
  predictionId,
  currentStatus,
}: PublishPredictionActionProps) {
  const router = useRouter();
  const isPublished = currentStatus === PublishStatus.PUBLISHED;

  const updateStatus = trpc.predictions.updateStatus.useMutation({
    onSuccess: () => {
      toast.success(
        `Prediction ${isPublished ? "unpublished" : "published"} successfully!`
      );
      router.refresh();
    },
    onError: (error) => {
      toast.error(
        `Failed to ${isPublished ? "unpublish" : "publish"} prediction`,
        {
          description: error.message,
        }
      );
    },
  });

  const handleClick = () => {
    updateStatus.mutate({
      id: predictionId,
      status: isPublished ? PublishStatus.DRAFT : PublishStatus.PUBLISHED,
    });
  };

  return (
    <DropdownMenuItem onClick={handleClick} disabled={updateStatus.isPending}>
      {isPublished ? (
        <EyeOff className="mr-2 h-4 w-4" />
      ) : (
        <Eye className="mr-2 h-4 w-4" />
      )}
      <span>{isPublished ? "Unpublish" : "Publish"}</span>
    </DropdownMenuItem>
  );
}
