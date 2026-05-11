"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { CandidateShell } from "@/components/candidate/CandidateShell";
import { StatusMessage } from "@/components/common/StatusMessage";
import { candidateApi } from "@/lib/api/candidate";
import { useCandidateSession } from "@/lib/auth/useCandidateSession";
import { useInfiniteScroll } from "@/lib/hooks/useInfiniteScroll";
import { ROUTES } from "@/routes/paths";
import type { CandidateApplication, CandidateJob } from "@/types/candidate";
import type { AppNotification } from "@/types/notification";
import type { PaginationMeta } from "@/types/pagination";
import styles from "@/components/candidate/candidate.module.css";

const formatSalary = (job: CandidateJob) => {
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

type RemoteFilter = "all" | "true" | "false";

export function CandidateJobsContainer() {
  const { session, isCheckingSession } = useCandidateSession();
  const [jobs, setJobs] = useState<CandidateJob[]>([]);
  const [applications, setApplications] = useState<CandidateApplication[]>([]);
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [remote, setRemote] = useState<RemoteFilter>("all");
  const [filters, setFilters] = useState({
    query: "",
    location: "",
    remote: "all" as RemoteFilter,
  });
  const [jobsPagination, setJobsPagination] = useState<PaginationMeta | null>(
    null
  );
  const [applicationsTotal, setApplicationsTotal] = useState(0);
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
      const jobResponse = await candidateApi.getJobs(token, {
        query: filters.query,
        location: filters.location,
        isRemote:
          filters.remote === "all" ? undefined : filters.remote === "true",
        page,
        limit: 10,
      });

      setJobs((currentJobs) =>
        append
          ? [
              ...currentJobs,
              ...jobResponse.jobs.filter(
                (job) => !currentJobs.some((current) => current.id === job.id)
              ),
            ]
          : jobResponse.jobs
      );
      setJobsPagination(jobResponse.pagination);

      if (!append) {
        const applicationResponse = await candidateApi.getApplications(token, {
          page: 1,
          limit: 50,
        });
        setApplications(applicationResponse.result);
        setApplicationsTotal(
          applicationResponse.pagination?.total ??
            applicationResponse.result.length
        );
      }
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load candidate jobs."
      );
    } finally {
      if (append) {
        setIsLoadingMore(false);
      } else {
        setIsLoading(false);
      }
    }
  }, [filters.location, filters.query, filters.remote]);

  useEffect(() => {
    if (session?.accessToken) {
      void loadJobs(session.accessToken);
    }
  }, [loadJobs, session?.accessToken]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFilters({
      query,
      location,
      remote,
    });
  };

  const handleRealtimeNotification = useCallback(
    (notification: AppNotification) => {
      if (
        (notification.type === "APPLICATION_STATUS_UPDATED" ||
          notification.type === "APPLICATION_SUBMITTED") &&
        session?.accessToken
      ) {
        void loadJobs(session.accessToken);
      }
    },
    [loadJobs, session?.accessToken]
  );

  const loadMoreJobs = useCallback(() => {
    if (
      !session?.accessToken ||
      !jobsPagination?.hasNextPage ||
      isLoadingMore
    ) {
      return;
    }

    void loadJobs(session.accessToken, jobsPagination.page + 1, true);
  }, [isLoadingMore, jobsPagination, loadJobs, session?.accessToken]);

  const loadMoreRef = useInfiniteScroll({
    hasMore: Boolean(jobsPagination?.hasNextPage),
    isLoading: isLoading || isLoadingMore,
    onLoadMore: loadMoreJobs,
  });

  const appliedJobIds = useMemo(
    () => new Set(applications.map((application) => application.jobId)),
    [applications]
  );

  const stats = useMemo(
    () => [
      { label: "Available jobs", value: jobsPagination?.total ?? jobs.length },
      { label: "Applications", value: applicationsTotal },
      { label: "Remote roles", value: jobs.filter((job) => job.isRemote).length },
    ],
    [applicationsTotal, jobs, jobsPagination?.total]
  );

  if (isCheckingSession || !session) {
    return <main className={styles.loading}>Checking candidate session...</main>;
  }

  return (
    <CandidateShell
      accessToken={session.accessToken}
      user={session.user}
      title="Find matching jobs"
      subtitle="Search active roles, open details, upload your resume, preview AI match, and apply from one place."
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

      <form className={styles.searchPanel} onSubmit={handleSubmit}>
        <label className={styles.field}>
          <span>Search</span>
          <input
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Role, skills, company"
            type="search"
            value={query}
          />
        </label>
        <label className={styles.field}>
          <span>Location</span>
          <input
            onChange={(event) => setLocation(event.target.value)}
            placeholder="Bengaluru, Remote"
            type="search"
            value={location}
          />
        </label>
        <label className={styles.field}>
          <span>Remote</span>
          <select
            onChange={(event) => setRemote(event.target.value as RemoteFilter)}
            value={remote}
          >
            <option value="all">All jobs</option>
            <option value="true">Remote only</option>
            <option value="false">Office roles</option>
          </select>
        </label>
        <button className={styles.primaryButton} type="submit">
          <Search size={17} />
          Search
        </button>
      </form>

      {error ? <StatusMessage tone="error" message={error} /> : null}

      {isLoading ? (
        <div className={styles.loading}>Loading jobs...</div>
      ) : jobs.length === 0 ? (
        <div className={styles.emptyState}>
          <h2>No jobs found.</h2>
          <p>Try changing the search or location filters.</p>
        </div>
      ) : (
        <div className={styles.jobsGrid}>
          {jobs.map((job) => {
            const hasApplied = appliedJobIds.has(job.id);

            return (
              <article className={styles.jobCard} key={job.id}>
                <div>
                  <h2>{job.title}</h2>
                  <div className={styles.jobMeta}>
                    <span className={styles.pill}>{job.companyName}</span>
                    <span className={styles.pill}>{job.location}</span>
                    <span className={styles.pill}>{job.employmentType}</span>
                    <span className={styles.pill}>{formatSalary(job)}</span>
                    {job.isRemote ? (
                      <span className={styles.statusPill}>Remote</span>
                    ) : null}
                    {hasApplied ? (
                      <span className={styles.scorePill}>Applied</span>
                    ) : null}
                  </div>
                  <p>{job.description}</p>
                </div>
                <div className={styles.jobActions}>
                  <Link
                    className={styles.secondaryButton}
                    href={ROUTES.candidateJob(job.id)}
                  >
                    Open
                  </Link>
                </div>
              </article>
            );
          })}
          {jobsPagination?.hasNextPage ? (
            <div className={styles.loadMoreSentinel} ref={loadMoreRef}>
              {isLoadingMore ? "Loading more jobs..." : ""}
            </div>
          ) : null}
        </div>
      )}
    </CandidateShell>
  );
}
