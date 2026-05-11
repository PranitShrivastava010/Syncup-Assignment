import { CandidateJobDetailContainer } from "@/containers/candidate/CandidateJobDetailContainer";

type CandidateJobDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function CandidateJobDetailPage({
  params,
}: CandidateJobDetailPageProps) {
  const { id } = await params;
  return <CandidateJobDetailContainer jobId={id} />;
}
