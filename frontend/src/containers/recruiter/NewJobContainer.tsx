"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { StatusMessage } from "@/components/common/StatusMessage";
import { JobForm } from "@/components/recruiter/JobForm";
import { RecruiterShell } from "@/components/recruiter/RecruiterShell";
import { recruiterApi } from "@/lib/api/recruiter";
import { useRecruiterSession } from "@/lib/auth/useRecruiterSession";
import type { JobFormPayload } from "@/types/recruiter";
import styles from "@/components/recruiter/recruiter.module.css";

export function NewJobContainer() {
  const router = useRouter();
  const { session, isCheckingSession } = useRecruiterSession();
  const [status, setStatus] = useState<{
    tone: "success" | "error";
    message: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (payload: JobFormPayload) => {
    if (!session?.accessToken) {
      return;
    }

    setIsSubmitting(true);
    setStatus(null);

    try {
      const response = await recruiterApi.createJob(session.accessToken, payload);
      setStatus({ tone: "success", message: "Job posted successfully." });
      window.setTimeout(
        () => router.push(`/recruiter/jobs/${response.result.id}`),
        500
      );
    } catch (error) {
      setStatus({
        tone: "error",
        message: error instanceof Error ? error.message : "Unable to post job.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isCheckingSession || !session) {
    return <main className={styles.loading}>Checking recruiter session...</main>;
  }

  return (
    <RecruiterShell
      accessToken={session.accessToken}
      user={session.user}
      title="Post a new job"
      subtitle="Create a role with enough context for candidates and AI matching to understand the opportunity."
    >
      <div className={styles.formPanel}>
        {status ? (
          <StatusMessage tone={status.tone} message={status.message} />
        ) : null}
        <JobForm
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
          submitLabel="Post job"
        />
      </div>
    </RecruiterShell>
  );
}
