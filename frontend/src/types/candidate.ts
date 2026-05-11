import type { ApplicationStatus } from "./recruiter";

export type CandidateJob = {
  id: string;
  title: string;
  description: string;
  requirements?: string | null;
  companyName: string;
  location: string;
  employmentType: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  isRemote: boolean;
  isActive: boolean;
  postedById?: string | null;
  createdAt: string;
  updatedAt: string;
  postedBy?: {
    id: string;
    name: string;
    email: string;
  } | null;
};

export type CandidateResume = {
  id: string;
  userId: string;
  originalName: string;
  storagePath: string;
  fileUrl: string;
  extractedText?: string | null;
  createdAt: string;
};

export type MatchResult = {
  score: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  summary: string;
  provider: "groq" | "local";
};

export type ApplyJobPayload = {
  jobId: string;
  resumeId: string;
  coverLetter?: string;
};

export type CandidateApplication = {
  id: string;
  userId: string;
  jobId: string;
  resumeId?: string | null;
  coverLetter?: string | null;
  status: ApplicationStatus;
  matchScore?: number | null;
  matchSummary?: string | null;
  createdAt: string;
  updatedAt: string;
  job: CandidateJob;
  resume?: CandidateResume | null;
};

export type ApplyJobResponse = {
  application: CandidateApplication;
  match: MatchResult;
};
