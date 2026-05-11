import { prisma } from "../lib/prisma";
import { calculateResumeMatchService } from "./ai.service";
import { createNotificationService } from "./notification.service";
import { createHttpError } from "../utils/httpError";
import { buildPaginationMeta, PaginationParams } from "../utils/pagination";

export type ApplyJobInput = {
  jobId: string;
  resumeId: string;
  coverLetter?: string;
};

export type ApplicationStatus =
  | "PENDING"
  | "REVIEWED"
  | "SHORTLISTED"
  | "REJECTED"
  | "HIRED";

export const applyToJobService = async (
  userId: string,
  input: ApplyJobInput
) => {
  const job = await prisma.job.findUnique({
    where: { id: input.jobId },
  });

  if (!job || !job.isActive) {
    throw createHttpError(404, "Job not found");
  }

  const existingApplication = await prisma.application.findUnique({
    where: {
      userId_jobId: {
        userId,
        jobId: input.jobId,
      },
    },
    select: {
      id: true,
    },
  });

  if (existingApplication) {
    throw createHttpError(409, "You have already applied to this job");
  }

  const application = await prisma.application.create({
    data: {
      userId,
      jobId: input.jobId,
      resumeId: input.resumeId,
      coverLetter: input.coverLetter,
      status: "PENDING",
    },
    include: {
      job: true,
      resume: true,
    },
  });

  // Start matching in background - do NOT await
  calculateResumeMatchService({
    userId,
    resumeId: input.resumeId,
    jobId: input.jobId,
  })
    .then(async (match) => {
      await prisma.application.update({
        where: { id: application.id },
        data: {
          matchScore: match?.score,
          matchSummary: match?.summary,
        },
      });

      await createNotificationService(userId, {
        type: "APPLICATION_MATCH_READY",
        title: "Match score ready",
        message: `Your AI match score for ${job.title} is ${match?.score}%.`,
        payload: {
          applicationId: application.id,
          jobId: job.id,
          score: match?.score,
        },
      });
    })
    .catch((err) => {
      console.error("[Background Match Error]", err);
    });

  await createNotificationService(userId, {
    type: "APPLICATION_SUBMITTED",
    title: "Application submitted",
    message: `Your application for ${job.title} was submitted. AI matching is in progress.`,
    payload: {
      applicationId: application.id,
      jobId: job.id,
    },
  });


  if (job.postedById && job.postedById !== userId) {
    await createNotificationService(job.postedById, {
      type: "NEW_APPLICATION",
      title: "New application received",
      message: `A candidate applied for ${job.title}.`,
      payload: {
        applicationId: application.id,
        jobId: job.id,
      },
    });
  }

  return {
    application,
  };

};

export const getMyApplicationsService = async (
  userId: string,
  pagination: PaginationParams
) => {
  const where = { userId };
  const [applications, total] = await prisma.$transaction([
    prisma.application.findMany({
      where,
      skip: pagination.skip,
      take: pagination.limit,
      orderBy: { createdAt: "desc" },
      include: {
        job: true,
        resume: true,
      },
    }),
    prisma.application.count({ where }),
  ]);

  return {
    result: applications,
    pagination: buildPaginationMeta({
      page: pagination.page,
      limit: pagination.limit,
      total,
    }),
  };
};

export const updateApplicationStatusService = async (
  userId: string,
  applicationId: string,
  status: ApplicationStatus
) => {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      job: true,
    },
  });

  if (!application) {
    throw createHttpError(404, "Application not found");
  }

  if (application.job.postedById !== userId) {
    throw createHttpError(403, "Only the job poster can update this status");
  }

  const updatedApplication = await prisma.application.update({
    where: { id: applicationId },
    data: { status },
    include: {
      job: true,
      resume: true,
    },
  });

  await createNotificationService(application.userId, {
    type: "APPLICATION_STATUS_UPDATED",
    title: "Application status updated",
    message: `Your application for ${application.job.title} is now ${status}.`,
    payload: {
      applicationId,
      jobId: application.jobId,
      status,
    },
  });

  return updatedApplication;
};
