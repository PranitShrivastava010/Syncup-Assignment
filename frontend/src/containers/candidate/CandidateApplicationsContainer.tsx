"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CandidateShell } from "@/components/candidate/CandidateShell";
import { StatusMessage } from "@/components/common/StatusMessage";
import { candidateApi } from "@/lib/api/candidate";
import { useCandidateSession } from "@/lib/auth/useCandidateSession";
import { useInfiniteScroll } from "@/lib/hooks/useInfiniteScroll";
import { ROUTES } from "@/routes/paths";
import type { CandidateApplication } from "@/types/candidate";
import type { AppNotification } from "@/types/notification";
import type { PaginationMeta } from "@/types/pagination";
import styles from "@/components/candidate/candidate.module.css";

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));

export function CandidateApplicationsContainer() {
  const { session, isCheckingSession } = useCandidateSession();
  const [applications, setApplications] = useState<CandidateApplication[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const loadApplications = useCallback(async (
    token: string,
    page = 1,
    append = false
  ) => {
    if (append) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
    }

    setError("");

    try {
      const response = await candidateApi.getApplications(token, {
        page,
        limit: 10,
      });
      setApplications((currentApplications) =>
        append
          ? [
              ...currentApplications,
              ...response.result.filter(
                (application) =>
                  !currentApplications.some(
                    (current) => current.id === application.id
                  )
              ),
            ]
          : response.result
      );
      setPagination(response.pagination ?? null);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load applications."
      );
    } finally {
      if (append) {
        setIsLoadingMore(false);
      } else {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (session?.accessToken) {
      void loadApplications(session.accessToken);
    }
  }, [loadApplications, session?.accessToken]);

  const handleRealtimeNotification = useCallback(
    (notification: AppNotification) => {
      if (
        (notification.type === "APPLICATION_STATUS_UPDATED" ||
          notification.type === "APPLICATION_SUBMITTED") &&
        session?.accessToken
      ) {
        void loadApplications(session.accessToken);
      }
    },
    [loadApplications, session?.accessToken]
  );

  const loadMoreApplications = useCallback(() => {
    if (!session?.accessToken || !pagination?.hasNextPage || isLoadingMore) {
      return;
    }

    void loadApplications(session.accessToken, pagination.page + 1, true);
  }, [isLoadingMore, loadApplications, pagination, session?.accessToken]);

  const loadMoreRef = useInfiniteScroll({
    hasMore: Boolean(pagination?.hasNextPage),
    isLoading: isLoading || isLoadingMore,
    onLoadMore: loadMoreApplications,
  });

  const stats = useMemo(
    () => [
      { label: "Total applications", value: pagination?.total ?? applications.length },
      {
        label: "Reviewed",
        value: applications.filter((item) => item.status === "REVIEWED").length,
      },
      {
        label: "Shortlisted",
        value: applications.filter((item) => item.status === "SHORTLISTED").length,
      },
      {
        label: "Hired",
        value: applications.filter((item) => item.status === "HIRED").length,
      },
    ],
    [applications, pagination?.total]
  );

  if (isCheckingSession || !session) {
    return <main className={styles.loading}>Checking candidate session...</main>;
  }

  return (
    <CandidateShell
      accessToken={session.accessToken}
      user={session.user}
      title="Your applications"
      subtitle="Track every submitted application, match score, resume, and recruiter status update."
      onNotification={handleRealtimeNotification}
    >
      <div className={styles.statsGrid}>
        {stats.map((stat) => (
          <div className={styles.statCard} key={stat.label}>
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </div>
        ))}
      </div>

      {error ? <StatusMessage tone="error" message={error} /> : null}

      {isLoading ? (
        <div className={styles.loading}>Loading applications...</div>
      ) : applications.length === 0 ? (
        <div className={styles.emptyState}>
          <h2>No applications yet.</h2>
          <p>Open a job, upload a resume, preview your match, and apply.</p>
          <Link className={styles.primaryButton} href={ROUTES.candidateJobs}>
            Browse jobs
          </Link>
        </div>
      ) : (
        <div className={styles.applicationsList}>
          {applications.map((application) => (
            <article className={styles.applicationCard} key={application.id}>
              <div>
                <h2>{application.job.title}</h2>
                <div className={styles.jobMeta}>
                  <span className={styles.pill}>{application.job.companyName}</span>
                  <span className={styles.pill}>{application.job.location}</span>
                  <span className={styles.statusPill}>{application.status}</span>
                  {typeof application.matchScore === "number" ? (
                    <span className={styles.scorePill}>
                      {Math.round(application.matchScore)}% match
                    </span>
                  ) : null}
                  <span className={styles.pill}>
                    Applied {formatDate(application.createdAt)}
                  </span>
                </div>
                {application.matchSummary ? (
                  <p>{application.matchSummary}</p>
                ) : null}
              </div>
              <div className={styles.applicationActions}>
                <Link
                  className={styles.secondaryButton}
                  href={ROUTES.candidateJob(application.jobId)}
                >
                  Open job
                </Link>
                {application.resume?.fileUrl ? (
                  <a
                    className={styles.secondaryButton}
                    href={application.resume.fileUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    Resume
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
    </CandidateShell>
  );
}
