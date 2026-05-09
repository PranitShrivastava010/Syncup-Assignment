import { z } from "zod";

export const matchResumeParamsSchema = z.object({
  params: z.object({
    resumeId: z.string().min(1),
    jobId: z.string().min(1),
  }),
});
