import { apiRequest } from "./client";
import type {
  ApplyJobPayload,
  ApplyJobResponse,
  CandidateApplication,
  CandidateJob,
  CandidateResume,
  MatchResult,
} from "@/types/candidate";
import type { PaginationMeta, PaginationQuery } from "@/types/pagination";

type ApiListResponse<T> = {
  success: boolean;
  result: T;
  pagination?: PaginationMeta;
};

type ApiMutationResponse<T> = {
  success: boolean;
  message: string;
  result: T;
};

type JobListResponse = {
  success: boolean;
  source: "cache" | "database";
  jobs: CandidateJob[];
  pagination: PaginationMeta;
};

type JobFilters = PaginationQuery & {
  query?: string;
  location?: string;
  isRemote?: boolean;
};

const buildQuery = (filters: Record<string, string | number | boolean | undefined>) => {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === "") {
      return;
    }

    params.set(key, String(value));
  });

  const query = params.toString();
  return query ? `?${query}` : "";
};

const buildJobQuery = (filters: JobFilters = {}) =>
  buildQuery({
    ...filters,
    query: filters.query?.trim() || undefined,
    location: filters.location?.trim() || undefined,
  });

const buildPaginationQuery = (pagination: PaginationQuery = {}) =>
  buildQuery({
    page: pagination.page,
    limit: pagination.limit,
  });

export const candidateApi = {
  getJobs: (token: string, filters?: JobFilters) =>
    apiRequest<JobListResponse>(`/api/jobs${buildJobQuery(filters)}`, {
      method: "GET",
      authToken: token,
    }),

  getJob: (token: string, jobId: string) =>
    apiRequest<ApiListResponse<CandidateJob>>(`/api/jobs/${jobId}`, {
      method: "GET",
      authToken: token,
    }),

  getResumes: (token: string, pagination?: PaginationQuery) =>
    apiRequest<ApiListResponse<CandidateResume[]>>(
      `/api/resumes${buildPaginationQuery(pagination)}`,
      {
        method: "GET",
        authToken: token,
      }
    ),

  uploadResume: (token: string, file: File) => {
    const formData = new FormData();
    formData.set("resume", file);

    return apiRequest<ApiMutationResponse<CandidateResume>>("/api/resumes", {
      method: "POST",
      authToken: token,
      body: formData,
    });
  },

  matchResume: (token: string, resumeId: string, jobId: string) =>
    apiRequest<ApiListResponse<MatchResult>>(
      `/api/resumes/${resumeId}/match/${jobId}`,
      {
        method: "POST",
        authToken: token,
      }
    ),

  getApplications: (token: string, pagination?: PaginationQuery) =>
    apiRequest<ApiListResponse<CandidateApplication[]>>(
      `/api/applications${buildPaginationQuery(pagination)}`,
      {
        method: "GET",
        authToken: token,
      }
    ),

  applyToJob: (token: string, payload: ApplyJobPayload) =>
    apiRequest<ApiMutationResponse<ApplyJobResponse>>("/api/applications", {
      method: "POST",
      authToken: token,
      body: payload,
    }),
};
