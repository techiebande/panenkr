import { redirect } from "next/navigation";

// For now, redirect predictions to main dashboard since 
// the predictions table is already shown there
export default function PredictionsPage() {
  redirect("/dashboard");
}