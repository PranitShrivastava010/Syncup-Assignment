import { prisma } from "../lib/prisma";
import { calculateResumeMatchService } from "./ai.service";
import { createNotificationService } from "./notification.service";
import { createHttpError } from "../utils/httpError";

export type ApplyJobInput = {
  jobId: string;
  resumeId?: string;
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

  let match:
    | Awaited<ReturnType<typeof calculateResumeMatchService>>
    | undefined;

  if (input.resumeId) {
    match = await calculateResumeMatchService({
      userId,
      resumeId: input.resumeId,
      jobId: input.jobId,
    });
  }

  const application = await prisma.application.create({
    data: {
      userId,
      jobId: input.jobId,
      resumeId: input.resumeId,
      coverLetter: input.coverLetter,
      matchScore: match?.score,
      matchSummary: match?.summary,
    },
    include: {
      job: true,
      resume: true,
    },
  });

  await createNotificationService(userId, {
    type: "APPLICATION_SUBMITTED",
    title: "Application submitted",
    message: `Your application for ${job.title} was submitted.`,
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
    match,
  };
};

export const getMyApplicationsService = async (userId: string) => {
  return prisma.application.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      job: true,
      resume: true,
    },
  });
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

  if (application.job.postedById && application.job.postedById !== userId) {
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
