import { RecruiterJobDetailContainer } from "@/containers/recruiter/RecruiterJobDetailContainer";

type RecruiterJobDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function RecruiterJobDetailPage({
  params,
}: RecruiterJobDetailPageProps) {
  const { id } = await params;
  return <RecruiterJobDetailContainer jobId={id} />;
}
