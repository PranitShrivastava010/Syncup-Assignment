import { apiRequest } from "./client";
import type {
  ApplicationStatus,
  Job,
  JobFormPayload,
  RecruiterJobApplicationsResponse,
} from "@/types/recruiter";
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

const buildPaginationQuery = (pagination: PaginationQuery = {}) => {
  const params = new URLSearchParams();

  if (pagination.page) {
    params.set("page", String(pagination.page));
  }

  if (pagination.limit) {
    params.set("limit", String(pagination.limit));
  }

  const query = params.toString();
  return query ? `?${query}` : "";
};

export const recruiterApi = {
  getMyJobs: (token: string, pagination?: PaginationQuery) =>
    apiRequest<ApiListResponse<Job[]>>(
      `/api/jobs/my-jobs${buildPaginationQuery(pagination)}`,
      {
        method: "GET",
        authToken: token,
      }
    ),

  createJob: (token: string, payload: JobFormPayload) =>
    apiRequest<ApiMutationResponse<Job>>("/api/jobs", {
      method: "POST",
      authToken: token,
      body: payload,
    }),

  updateJob: (token: string, jobId: string, payload: Partial<JobFormPayload>) =>
    apiRequest<ApiMutationResponse<Job>>(`/api/jobs/${jobId}`, {
      method: "PATCH",
      authToken: token,
      body: payload,
    }),

  deactivateJob: (token: string, jobId: string) =>
    apiRequest<ApiMutationResponse<Job>>(`/api/jobs/${jobId}`, {
      method: "DELETE",
      authToken: token,
    }),

  getJobApplications: (
    token: string,
    jobId: string,
    pagination?: PaginationQuery
  ) =>
    apiRequest<ApiListResponse<RecruiterJobApplicationsResponse>>(
      `/api/jobs/${jobId}/applications${buildPaginationQuery(pagination)}`,
      {
        method: "GET",
        authToken: token,
      }
    ),

  updateApplicationStatus: (
    token: string,
    applicationId: string,
    status: ApplicationStatus
  ) =>
    apiRequest<ApiMutationResponse<unknown>>(
      `/api/applications/${applicationId}/status`,
      {
        method: "PATCH",
        authToken: token,
        body: { status },
      }
    ),
};
