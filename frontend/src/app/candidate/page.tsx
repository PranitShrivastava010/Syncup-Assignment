import { redirect } from "next/navigation";
import { ROUTES } from "@/routes/paths";

export default function CandidatePage() {
  redirect(ROUTES.candidateJobs);
}
