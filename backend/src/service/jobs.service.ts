import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { getCachedValue, setCachedValue } from "./cache.service";
import { createHttpError } from "../utils/httpError";

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

export type JobFilters = {
  query?: string;
  location?: string;
  isRemote?: boolean;
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
  return prisma.job.create({
    data: {
      ...input,
      postedById: userId,
      isRemote: input.isRemote ?? false,
    },
  });
};

export const listJobsService = async (filters: JobFilters) => {
  const cacheKey = `jobs:${JSON.stringify(filters)}`;
  const cachedJobs = await getCachedValue<Awaited<ReturnType<typeof fetchJobs>>>(
    cacheKey
  );

  if (cachedJobs) {
    return {
      source: "cache",
      jobs: cachedJobs,
    };
  }

  const jobs = await fetchJobs(filters);
  await setCachedValue(cacheKey, jobs, 60);

  return {
    source: "database",
    jobs,
  };
};

const fetchJobs = async (filters: JobFilters) => {
  return prisma.job.findMany({
    where: buildJobWhere(filters),
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
  });
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
