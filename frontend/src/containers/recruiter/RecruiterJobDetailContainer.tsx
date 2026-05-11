"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { StatusMessage } from "@/components/common/StatusMessage";
import { JobForm } from "@/components/recruiter/JobForm";
import { RecruiterShell } from "@/components/recruiter/RecruiterShell";
import { recruiterApi } from "@/lib/api/recruiter";
import { useRecruiterSession } from "@/lib/auth/useRecruiterSession";
import { useInfiniteScroll } from "@/lib/hooks/useInfiniteScroll";
import type { AppNotification } from "@/types/notification";
import type { PaginationMeta } from "@/types/pagination";
import type {
  ApplicationStatus,
  Job,
  JobFormPayload,
  RecruiterApplication,
} from "@/types/recruiter";
import styles from "@/components/recruiter/recruiter.module.css";

const statuses: ApplicationStatus[] = [
  "PENDING",
  "REVIEWED",
  "SHORTLISTED",
  "REJECTED",
  "HIRED",
];

type RecruiterJobDetailContainerProps = {
  jobId: string;
};

export function RecruiterJobDetailContainer({
  jobId,
}: RecruiterJobDetailContainerProps) {
  const { session, isCheckingSession } = useRecruiterSession();
  const [job, setJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<RecruiterApplication[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [status, setStatus] = useState<{
    tone: "success" | "error";
    message: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updatingApplicationId, setUpdatingApplicationId] = useState("");

  const loadDetail = useCallback(async (
    token: string,
    page = 1,
    append = false
  ) => {
    if (append) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
      setStatus(null);
    }

    try {
      const applicationsResponse = await recruiterApi.getJobApplications(
        token,
        jobId,
        {
          page,
          limit: 10,
        }
      );

      setJob(applicationsResponse.result.job);
      setApplications((currentApplications) =>
        append
          ? [
              ...currentApplications,
              ...applicationsResponse.result.applications.filter(
                (application) =>
                  !currentApplications.some(
                    (current) => current.id === application.id
                  )
              ),
            ]
          : applicationsResponse.result.applications
      );
      setPagination(applicationsResponse.pagination ?? null);
    } catch (error) {
      setStatus({
        tone: "error",
        message:
          error instanceof Error ? error.message : "Unable to load job detail.",
      });
    } finally {
      if (append) {
        setIsLoadingMore(false);
      } else {
        setIsLoading(false);
      }
    }
  }, [jobId]);

  useEffect(() => {
    if (session?.accessToken) {
      void loadDetail(session.accessToken);
    }
  }, [loadDetail, session?.accessToken]);

  const handleRealtimeNotification = useCallback(
    (notification: AppNotification) => {
      if (
        notification.type === "NEW_APPLICATION" &&
        notification.payload?.jobId === jobId &&
        session?.accessToken
      ) {
        void loadDetail(session.accessToken);
      }
    },
    [jobId, loadDetail, session?.accessToken]
  );

  const loadMoreApplications = useCallback(() => {
    if (!session?.accessToken || !pagination?.hasNextPage || isLoadingMore) {
      return;
    }

    void loadDetail(session.accessToken, pagination.page + 1, true);
  }, [isLoadingMore, loadDetail, pagination, session?.accessToken]);

  const loadMoreRef = useInfiniteScroll({
    hasMore: Boolean(pagination?.hasNextPage),
    isLoading: isLoading || isLoadingMore,
    onLoadMore: loadMoreApplications,
  });

  const applicationStats = useMemo(() => {
    return statuses.map((statusValue) => ({
      status: statusValue,
      count: applications.filter((item) => item.status === statusValue).length,
    }));
  }, [applications]);

  const handleUpdateJob = async (payload: JobFormPayload) => {
    if (!session?.accessToken) {
      return;
    }

    setIsSubmitting(true);
    setStatus(null);

    try {
      const response = await recruiterApi.updateJob(
        session.accessToken,
        jobId,
        payload
      );
      setJob(response.result);
      setStatus({ tone: "success", message: "Job updated successfully." });
    } catch (error) {
      setStatus({
        tone: "error",
        message: error instanceof Error ? error.message : "Unable to update job.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeactivate = async () => {
    if (!session?.accessToken) {
      return;
    }

    setIsSubmitting(true);
    setStatus(null);

    try {
      const response = await recruiterApi.deactivateJob(session.accessToken, jobId);
      setJob(response.result);
      setStatus({ tone: "success", message: "Job deactivated." });
    } catch (error) {
      setStatus({
        tone: "error",
        message:
          error instanceof Error ? error.message : "Unable to deactivate job.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (
    applicationId: string,
    nextStatus: ApplicationStatus
  ) => {
    if (!session?.accessToken) {
      return;
    }

    setUpdatingApplicationId(applicationId);
    setStatus(null);

    try {
      await recruiterApi.updateApplicationStatus(
        session.accessToken,
        applicationId,
        nextStatus
      );
      setApplications((current) =>
        current.map((application) =>
          application.id === applicationId
            ? { ...application, status: nextStatus }
            : application
        )
      );
      setStatus({ tone: "success", message: "Application status updated." });
    } catch (error) {
      setStatus({
        tone: "error",
        message:
          error instanceof Error
            ? error.message
            : "Unable to update application.",
      });
    } finally {
      setUpdatingApplicationId("");
    }
  };

  if (isCheckingSession || !session) {
    return <main className={styles.loading}>Checking recruiter session...</main>;
  }

  return (
    <RecruiterShell
      accessToken={session.accessToken}
      user={session.user}
      title={job?.title ?? "Job detail"}
      subtitle="Edit the role, review candidate applications, and update hiring status."
      onNotification={handleRealtimeNotification}
    >
      {status ? <StatusMessage tone={status.tone} message={status.message} /> : null}

      {isLoading ? (
        <div className={styles.loading}>Loading job detail...</div>
      ) : !job ? (
        <div className={styles.emptyState}>
          <h2>Job not found.</h2>
          <p>This job may not belong to your recruiter account.</p>
        </div>
      ) : (
        <>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <strong>{pagination?.total ?? applications.length}</strong>
              <span>Total applications</span>
            </div>
            {applicationStats.slice(1, 4).map((item) => (
              <div className={styles.statCard} key={item.status}>
                <strong>{item.count}</strong>
                <span>{item.status.toLowerCase()}</span>
              </div>
            ))}
          </div>

          <div className={styles.formPanel}>
            <JobForm
              initialJob={job}
              isSubmitting={isSubmitting}
              onSubmit={handleUpdateJob}
              submitLabel="Save changes"
            />
            {job.isActive ? (
              <button
                className={styles.dangerButton}
                disabled={isSubmitting}
                type="button"
                onClick={handleDeactivate}
              >
                Deactivate job
              </button>
            ) : null}
          </div>

          <div className={styles.sectionTitle}>
            <p>Applications</p>
            <h2>Candidate pipeline</h2>
          </div>

          {applications.length === 0 ? (
            <div className={styles.emptyState}>
              <h2>No applications yet.</h2>
              <p>Candidates will appear here after applying to this role.</p>
            </div>
          ) : (
            <div className={styles.applicationsList}>
              {applications.map((application) => (
                <article className={styles.applicationCard} key={application.id}>
                  <div>
                    <h3>{application.user.name}</h3>
                    <div className={styles.jobMeta}>
                      <span className={styles.pill}>{application.user.email}</span>
                      <span className={styles.statusPill}>{application.status}</span>
                      {typeof application.matchScore === "number" ? (
                        <span className={styles.pill}>
                          {Math.round(application.matchScore)}% match
                        </span>
                      ) : null}
                    </div>
                    {application.matchSummary ? (
                      <p>{application.matchSummary}</p>
                    ) : null}
                    {application.coverLetter ? (
                      <p>{application.coverLetter}</p>
                    ) : null}
                  </div>
                  <div className={styles.applicationActions}>
                    <select
                      disabled={updatingApplicationId === application.id}
                      value={application.status}
                      onChange={(event) =>
                        void handleStatusChange(
                          application.id,
                          event.target.value as ApplicationStatus
                        )
                      }
                    >
                      {statuses.map((statusOption) => (
                        <option key={statusOption} value={statusOption}>
                          {statusOption}
                        </option>
                      ))}
                    </select>
                    {application.resume?.fileUrl ? (
                      <a
                        className={styles.secondaryButton}
                        href={application.resume.fileUrl}
                        rel="noreferrer"
                        target="_blank"
                      >
                        View resume
                      </a>
                    ) : null}
                  </div>
                </article>
              ))}
              {pagination?.hasNextPage ? (
                <div className={styles.loadMoreSentinel} ref={loadMoreRef}>
                  {isLoadingMore ? "Loading more applications..." : ""}
                </div>
              ) : null}
            </div>
          )}
        </>
      )}
    </RecruiterShell>
  );
}
