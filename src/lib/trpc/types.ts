import { type inferRouterOutputs } from "@trpc/server";
import { type AppRouter } from "@/lib/trpc/root";

type RouterOutputs = inferRouterOutputs<AppRouter>;

export type PredictionWithMatch = RouterOutputs["predictions"]["getById"];
