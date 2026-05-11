import type { AuthUser } from "./auth";

export type Job = {
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
  _count?: {
    applications: number;
  };
};

export type JobFormPayload = {
  title: string;
  description: string;
  requirements?: string;
  companyName: string;
  location: string;
  employmentType: string;
  salaryMin?: number;
  salaryMax?: number;
  isRemote: boolean;
};

export type ApplicationStatus =
  | "PENDING"
  | "REVIEWED"
  | "SHORTLISTED"
  | "REJECTED"
  | "HIRED";

export type RecruiterApplication = {
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
  user: Pick<AuthUser, "id" | "name" | "email">;
  resume?: {
    id: string;
    originalName: string;
    fileUrl: string;
    storagePath: string;
    extractedText?: string | null;
    createdAt: string;
  } | null;
};

export type RecruiterJobApplicationsResponse = {
  job: Job;
  applications: RecruiterApplication[];
};
