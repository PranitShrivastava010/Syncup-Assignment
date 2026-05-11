import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import {
  getCachedValue,
  incrementCachedCounter,
  setCachedValue,
} from "./cache.service";
import { createHttpError } from "../utils/httpError";
import { buildPaginationMeta, PaginationParams } from "../utils/pagination";

export type CreateJobInput = {
  title: string;
  description: string;
  requirements?: string;
  companyName: string;
  location: string;
  employmentType: string;
  salaryMin?: number;
  salaryMax?: number;
  isRemote?: boolean;
};

export type UpdateJobInput = Partial<CreateJobInput> & {
  isActive?: boolean;
};

export type JobFilters = {
  query?: string;
  location?: string;
  isRemote?: boolean;
};

const JOBS_CACHE_VERSION_KEY = "jobs:cache-version";
const JOBS_CACHE_TTL_SECONDS = 60;

const getJobsCacheVersion = async () => {
  const version = await getCachedValue<number | string>(JOBS_CACHE_VERSION_KEY);
  return version?.toString() ?? "0";
};

const buildJobsCacheKey = async (filters: JobFilters) => {
  const version = await getJobsCacheVersion();
  return `jobs:v${version}:${JSON.stringify(filters)}`;
};

const invalidateJobsCache = async () => {
  await incrementCachedCounter(JOBS_CACHE_VERSION_KEY);
};

const buildJobWhere = (filters: JobFilters): Prisma.JobWhereInput => {
  const andFilters: Prisma.JobWhereInput[] = [{ isActive: true }];

  if (filters.query) {
    andFilters.push({
      OR: [
        { title: { contains: filters.query } },
        { description: { contains: filters.query } },
        { requirements: { contains: filters.query } },
        { companyName: { contains: filters.query } },
      ],
    });
  }

  if (filters.location) {
    andFilters.push({ location: { contains: filters.location } });
  }

  if (typeof filters.isRemote === "boolean") {
    andFilters.push({ isRemote: filters.isRemote });
  }

  return { AND: andFilters };
};

export const createJobService = async (
  userId: string,
  input: CreateJobInput
) => {
  const job = await prisma.job.create({
    data: {
      ...input,
      postedById: userId,
      isRemote: input.isRemote ?? false,
    },
  });

  await invalidateJobsCache();

  return job;
};

export const getRecruiterJobsService = async (
  userId: string,
  pagination: PaginationParams
) => {
  const where: Prisma.JobWhereInput = { postedById: userId };
  const [jobs, total] = await prisma.$transaction([
    prisma.job.findMany({
      where,
      skip: pagination.skip,
      take: pagination.limit,
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            applications: true,
          },
        },
      },
    }),
    prisma.job.count({ where }),
  ]);

  return {
    result: jobs,
    pagination: buildPaginationMeta({
      page: pagination.page,
      limit: pagination.limit,
      total,
    }),
  };
};

export const listJobsService = async (
  filters: JobFilters,
  pagination: PaginationParams
) => {
  const cacheKey = await buildJobsCacheKey({ ...filters, ...pagination });
  const cachedResult =
    await getCachedValue<Awaited<ReturnType<typeof fetchJobs>>>(cacheKey);

  if (cachedResult) {
    return {
      source: "cache",
      ...cachedResult,
    };
  }

  const result = await fetchJobs(filters, pagination);
  await setCachedValue(cacheKey, result, JOBS_CACHE_TTL_SECONDS);

  return {
    source: "database",
    ...result,
  };
};

const fetchJobs = async (filters: JobFilters, pagination: PaginationParams) => {
  const where = buildJobWhere(filters);
  const [jobs, total] = await prisma.$transaction([
    prisma.job.findMany({
      where,
      skip: pagination.skip,
      take: pagination.limit,
      orderBy: { createdAt: "desc" },
      include: {
        postedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    }),
    prisma.job.count({ where }),
  ]);

  return {
    jobs,
    pagination: buildPaginationMeta({
      page: pagination.page,
      limit: pagination.limit,
      total,
    }),
  };
};

export const getJobByIdService = async (jobId: string) => {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: {
      postedBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!job || !job.isActive) {
    throw createHttpError(404, "Job not found");
  }

  return job;
};

export const updateRecruiterJobService = async (
  userId: string,
  jobId: string,
  input: UpdateJobInput
) => {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    select: { postedById: true },
  });

  if (!job) {
    throw createHttpError(404, "Job not found");
  }

  if (job.postedById !== userId) {
    throw createHttpError(403, "Only the job poster can update this job");
  }

  const updatedJob = await prisma.job.update({
    where: { id: jobId },
    data: input,
  });

  await invalidateJobsCache();

  return updatedJob;
};

export const deactivateRecruiterJobService = async (
  userId: string,
  jobId: string
) => {
  return updateRecruiterJobService(userId, jobId, { isActive: false });
};

export const getRecruiterJobApplicationsService = async (
  userId: string,
  jobId: string,
  pagination: PaginationParams
) => {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    select: {
      id: true,
      title: true,
      description: true,
      requirements: true,
      companyName: true,
      location: true,
      employmentType: true,
      salaryMin: true,
      salaryMax: true,
      isRemote: true,
      isActive: true,
      postedById: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!job) {
    throw createHttpError(404, "Job not found");
  }

  if (job.postedById !== userId) {
    throw createHttpError(403, "Only the job poster can view applications");
  }

  const where: Prisma.ApplicationWhereInput = { jobId };
  const [applications, total] = await prisma.$transaction([
    prisma.application.findMany({
      where,
      skip: pagination.skip,
      take: pagination.limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        resume: true,
      },
    }),
    prisma.application.count({ where }),
  ]);

  return {
    job,
    applications,
    pagination: buildPaginationMeta({
      page: pagination.page,
      limit: pagination.limit,
      total,
    }),
  };
};
