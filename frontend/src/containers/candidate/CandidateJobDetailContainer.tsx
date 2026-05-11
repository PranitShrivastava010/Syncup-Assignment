"use client";

import Link from "next/link";
import {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Upload } from "lucide-react";
import { CandidateShell } from "@/components/candidate/CandidateShell";
import { StatusMessage } from "@/components/common/StatusMessage";
import { ApiError } from "@/lib/api/client";
import { candidateApi } from "@/lib/api/candidate";
import { useCandidateSession } from "@/lib/auth/useCandidateSession";
import { ROUTES } from "@/routes/paths";
import type {
  CandidateApplication,
  CandidateJob,
  CandidateResume,
  MatchResult,
} from "@/types/candidate";
import type { AppNotification } from "@/types/notification";
import styles from "@/components/candidate/candidate.module.css";

type CandidateJobDetailContainerProps = {
  jobId: string;
};

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

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
};

export function CandidateJobDetailContainer({
  jobId,
}: CandidateJobDetailContainerProps) {
  const { session, isCheckingSession } = useCandidateSession();
  const [job, setJob] = useState<CandidateJob | null>(null);
  const [resumes, setResumes] = useState<CandidateResume[]>([]);
  const [applications, setApplications] = useState<CandidateApplication[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [match, setMatch] = useState<MatchResult | null>(null);
  const [matchedResumeId, setMatchedResumeId] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [status, setStatus] = useState<{
    tone: "success" | "error";
    message: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isMatching, setIsMatching] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  const loadDetail = useCallback(async (token: string) => {
    setIsLoading(true);
    setStatus(null);

    try {
      const [jobResponse, resumeResponse, applicationResponse] =
        await Promise.all([
          candidateApi.getJob(token, jobId),
          candidateApi.getResumes(token, { page: 1, limit: 50 }),
          candidateApi.getApplications(token, { page: 1, limit: 50 }),
        ]);

      setJob(jobResponse.result);
      setResumes(resumeResponse.result);
      setApplications(applicationResponse.result);
      setSelectedResumeId((current) => current || resumeResponse.result[0]?.id || "");
    } catch (loadError) {
      setStatus({
        tone: "error",
        message: getErrorMessage(loadError, "Unable to load job detail."),
      });
    } finally {
      setIsLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    if (session?.accessToken) {
      void loadDetail(session.accessToken);
    }
  }, [loadDetail, session?.accessToken]);

  const existingApplication = useMemo(
    () =>
      applications.find((application) => application.jobId === jobId) ?? null,
    [applications, jobId]
  );

  const selectedResume = useMemo(
    () => resumes.find((resume) => resume.id === selectedResumeId) ?? null,
    [resumes, selectedResumeId]
  );

  const handleResumeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedResumeId(event.target.value);
    setMatch(null);
    setMatchedResumeId("");
  };

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file || !session?.accessToken) {
      return;
    }

    if (file.type !== "application/pdf") {
      setStatus({ tone: "error", message: "Please upload a PDF resume." });
      return;
    }

    setIsUploading(true);
    setStatus(null);

    try {
      const response = await candidateApi.uploadResume(session.accessToken, file);
      setResumes((current) => [response.result, ...current]);
      setSelectedResumeId(response.result.id);
      setMatch(null);
      setMatchedResumeId("");
      setStatus({ tone: "success", message: "Resume uploaded successfully." });
    } catch (uploadError) {
      setStatus({
        tone: "error",
        message: getErrorMessage(uploadError, "Unable to upload resume."),
      });
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  const handleMatch = async () => {
    if (!selectedResumeId || !session?.accessToken) {
      setStatus({ tone: "error", message: "Select or upload a resume first." });
      return;
    }

    setIsMatching(true);
    setStatus(null);

    try {
      const response = await candidateApi.matchResume(
        session.accessToken,
        selectedResumeId,
        jobId
      );
      setMatch(response.result);
      setMatchedResumeId(selectedResumeId);
    } catch (matchError) {
      setStatus({
        tone: "error",
        message: getErrorMessage(matchError, "Unable to generate match score."),
      });
    } finally {
      setIsMatching(false);
    }
  };

  const handleApply = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!session?.accessToken || !selectedResumeId) {
      setStatus({ tone: "error", message: "Select or upload a resume first." });
      return;
    }

    if (!match || matchedResumeId !== selectedResumeId) {
      setStatus({
        tone: "error",
        message: "Preview the AI match for the selected resume before applying.",
      });
      return;
    }

    setIsApplying(true);
    setStatus(null);

    try {
      const response = await candidateApi.applyToJob(session.accessToken, {
        jobId,
        resumeId: selectedResumeId,
        coverLetter: coverLetter.trim() || undefined,
      });

      setApplications((current) => [response.result.application, ...current]);
      setStatus({ tone: "success", message: "Application submitted." });
    } catch (applyError) {
      setStatus({
        tone: "error",
        message: getErrorMessage(applyError, "Unable to apply to this job."),
      });
    } finally {
      setIsApplying(false);
    }
  };

  const handleRealtimeNotification = useCallback(
    (notification: AppNotification) => {
      if (
        notification.type === "APPLICATION_STATUS_UPDATED" &&
        notification.payload?.jobId === jobId &&
        session?.accessToken
      ) {
        void loadDetail(session.accessToken);
      }
    },
    [jobId, loadDetail, session?.accessToken]
  );

  if (isCheckingSession || !session) {
    return <main className={styles.loading}>Checking candidate session...</main>;
  }

  return (
    <CandidateShell
      accessToken={session.accessToken}
      user={session.user}
      title={job?.title ?? "Job detail"}
      subtitle="Review the role, select a resume, preview AI matching, and apply with confidence."
      onNotification={handleRealtimeNotification}
    >
      {status ? <StatusMessage tone={status.tone} message={status.message} /> : null}

      {isLoading ? (
        <div className={styles.loading}>Loading job detail...</div>
      ) : !job ? (
        <div className={styles.emptyState}>
          <h2>Job not found.</h2>
          <p>This job may be inactive or unavailable.</p>
        </div>
      ) : (
        <div className={styles.detailGrid}>
          <section className={styles.detailPanel}>
            <div className={styles.sectionTitle}>
              <p>Opportunity</p>
              <h2>{job.title}</h2>
            </div>
            <div className={styles.jobMeta}>
              <span className={styles.pill}>{job.companyName}</span>
              <span className={styles.pill}>{job.location}</span>
              <span className={styles.pill}>{job.employmentType}</span>
              <span className={styles.pill}>{formatSalary(job)}</span>
              {job.isRemote ? <span className={styles.statusPill}>Remote</span> : null}
              {existingApplication ? (
                <span className={styles.scorePill}>
                  Applied: {existingApplication.status}
                </span>
              ) : null}
            </div>
            <p>{job.description}</p>
            {job.requirements ? <p>{job.requirements}</p> : null}
          </section>

          <section className={`${styles.detailPanel} ${styles.resumePanel}`}>
            <div className={styles.sectionTitle}>
              <p>Resume Match</p>
              <h2>Apply with context</h2>
            </div>

            {existingApplication ? (
              <div className={styles.matchBox}>
                <div className={styles.matchScore}>
                  <span className={styles.statusPill}>
                    {existingApplication.status}
                  </span>
                  {typeof existingApplication.matchScore === "number" ? (
                    <strong>{Math.round(existingApplication.matchScore)}%</strong>
                  ) : null}
                </div>
                {existingApplication.matchSummary ? (
                  <p>{existingApplication.matchSummary}</p>
                ) : (
                  <p>Your application has already been submitted.</p>
                )}
                <Link
                  className={styles.secondaryButton}
                  href={ROUTES.candidateApplications}
                >
                  View applications
                </Link>
              </div>
            ) : (
              <>
                <label className={styles.field}>
                  <span>Select resume</span>
                  <select
                    disabled={resumes.length === 0}
                    onChange={handleResumeChange}
                    value={selectedResumeId}
                  >
                    {resumes.length === 0 ? (
                      <option value="">Upload a resume first</option>
                    ) : null}
                    {resumes.map((resume) => (
                      <option key={resume.id} value={resume.id}>
                        {resume.originalName}
                      </option>
                    ))}
                  </select>
                </label>

                <label className={styles.uploadField}>
                  <span>Upload PDF resume</span>
                  <input
                    accept="application/pdf"
                    disabled={isUploading}
                    type="file"
                    onChange={handleUpload}
                  />
                </label>

                {selectedResume ? (
                  <a
                    className={styles.secondaryButton}
                    href={selectedResume.fileUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    View selected resume
                  </a>
                ) : null}

                <button
                  className={styles.secondaryButton}
                  disabled={!selectedResumeId || isMatching}
                  type="button"
                  onClick={handleMatch}
                >
                  {isMatching ? "Matching..." : "Preview AI match"}
                </button>

                {match ? (
                  <div className={styles.matchBox}>
                    <div className={styles.matchScore}>
                      <span className={styles.statusPill}>{match.provider}</span>
                      <strong>{match.score}%</strong>
                    </div>
                    <p>{match.summary}</p>
                    <div className={styles.keywordGroup}>
                      {match.matchedKeywords.slice(0, 6).map((keyword) => (
                        <span className={styles.statusPill} key={keyword}>
                          {keyword}
                        </span>
                      ))}
                      {match.missingKeywords.slice(0, 4).map((keyword) => (
                        <span className={styles.pill} key={keyword}>
                          Missing: {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}

                <form className={styles.resumePanel} onSubmit={handleApply}>
                  <label className={styles.coverLetterLabel}>
                    <span>Cover letter</span>
                    <textarea
                      maxLength={4000}
                      onChange={(event) => setCoverLetter(event.target.value)}
                      placeholder="Add a short note for the recruiter"
                      value={coverLetter}
                    />
                  </label>
                  <button
                    className={styles.primaryButton}
                    disabled={
                      isApplying ||
                      !selectedResumeId ||
                      !match ||
                      matchedResumeId !== selectedResumeId
                    }
                    type="submit"
                  >
                    <Upload size={17} />
                    {isApplying ? "Applying..." : "Apply now"}
                  </button>
                </form>
              </>
            )}
          </section>
        </div>
      )}
    </CandidateShell>
  );
}
