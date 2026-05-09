import { z } from "zod";

export const applyJobSchema = z.object({
  body: z.object({
    jobId: z.string().min(1),
    resumeId: z.string().min(1).optional(),
    coverLetter: z.string().max(4000).optional(),
  }),
});

export const updateApplicationStatusSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    status: z.enum(["PENDING", "REVIEWED", "SHORTLISTED", "REJECTED", "HIRED"]),
  }),
});
