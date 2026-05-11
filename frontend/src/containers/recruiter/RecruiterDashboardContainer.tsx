"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { StatusMessage } from "@/components/common/StatusMessage";
import { RecruiterShell } from "@/components/recruiter/RecruiterShell";
import { recruiterApi } from "@/lib/api/recruiter";
import { useRecruiterSession } from "@/lib/auth/useRecruiterSession";
import { useInfiniteScroll } from "@/lib/hooks/useInfiniteScroll";
import { ROUTES } from "@/routes/paths";
import type { AppNotification } from "@/types/notification";
import type { PaginationMeta } from "@/types/pagination";
import type { Job } from "@/types/recruiter";
import styles from "@/components/recruiter/recruiter.module.css";

const formatSalary = (job: Job) => {
  if (!job.salaryMin && !job.salaryMax) {
    return "Salary not listed";
  }

  const formatter = new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  });

  if (job.salaryMin && job.salaryMax) {
    return `${formatter.format(job.salaryMin)} - ${formatter.format(
      job.salaryMax
    )}`;
  }

  return job.salaryMin
    ? `From ${formatter.format(job.salaryMin)}`
    : `Up to ${formatter.format(job.salaryMax ?? 0)}`;
};

export function RecruiterDashboardContainer() {
  const { session, isCheckingSession } = useRecruiterSession();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const loadJobs = useCallback(async (
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
      const response = await recruiterApi.getMyJobs(token, {
        page,
        limit: 10,
      });
      setJobs((currentJobs) =>
        append
          ? [
              ...currentJobs,
              ...response.result.filter(
                (job) => !currentJobs.some((current) => current.id === job.id)
              ),
            ]
          : response.result
      );
      setPagination(response.pagination ?? null);
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "Unable to load jobs."
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
      void loadJobs(session.accessToken);
    }
  }, [loadJobs, session?.accessToken]);

  const handleRealtimeNotification = useCallback(
    (notification: AppNotification) => {
      if (notification.type === "NEW_APPLICATION" && session?.accessToken) {
        void loadJobs(session.accessToken);
      }
    },
    [loadJobs, session?.accessToken]
  );

  const loadMoreJobs = useCallback(() => {
    if (!session?.accessToken || !pagination?.hasNextPage || isLoadingMore) {
      return;
    }

    void loadJobs(session.accessToken, pagination.page + 1, true);
  }, [isLoadingMore, loadJobs, pagination, session?.accessToken]);

  const loadMoreRef = useInfiniteScroll({
    hasMore: Boolean(pagination?.hasNextPage),
    isLoading: isLoading || isLoadingMore,
    onLoadMore: loadMoreJobs,
  });

  const stats = useMemo(() => {
    const applications = jobs.reduce(
      (total, job) => total + (job._count?.applications ?? 0),
      0
    );

    return [
      { label: "Total jobs", value: pagination?.total ?? jobs.length },
      { label: "Active jobs", value: jobs.filter((job) => job.isActive).length },
      { label: "Applications", value: applications },
      { label: "Remote jobs", value: jobs.filter((job) => job.isRemote).length },
    ];
  }, [jobs, pagination?.total]);

  if (isCheckingSession || !session) {
    return <main className={styles.loading}>Checking recruiter session...</main>;
  }

  return (
    <RecruiterShell
      accessToken={session.accessToken}
      user={session.user}
      title="Recruiter dashboard"
      subtitle="Manage posted roles, review applications, and move candidates through your hiring pipeline."
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
        <div className={styles.loading}>Loading jobs...</div>
      ) : jobs.length === 0 ? (
        <div className={styles.emptyState}>
          <h2>No jobs posted yet.</h2>
          <p>Create your first job so candidates can start applying.</p>
          <Link className={styles.primaryButton} href={ROUTES.recruiterNewJob}>
            Post first job
          </Link>
        </div>
      ) : (
        <div className={styles.jobsGrid}>
          {jobs.map((job) => (
            <article className={styles.jobCard} key={job.id}>
              <div>
                <h2>{job.title}</h2>
                <div className={styles.jobMeta}>
                  <span className={styles.pill}>{job.companyName}</span>
                  <span className={styles.pill}>{job.location}</span>
                  <span className={styles.pill}>{job.employmentType}</span>
                  <span className={styles.pill}>{formatSalary(job)}</span>
                  {job.isRemote ? <span className={styles.pill}>Remote</span> : null}
                  <span className={styles.statusPill}>
                    {job.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
              <div className={styles.jobActions}>
                <span className={styles.pill}>
                  {job._count?.applications ?? 0} applications
                </span>
                <Link
                  className={styles.secondaryButton}
                  href={ROUTES.recruiterJob(job.id)}
                >
                  Open
                </Link>
              </div>
            </article>
          ))}
          {pagination?.hasNextPage ? (
            <div className={styles.loadMoreSentinel} ref={loadMoreRef}>
              {isLoadingMore ? "Loading more jobs..." : ""}
            </div>
          ) : null}
        </div>
      )}
    </RecruiterShell>
  );
}
