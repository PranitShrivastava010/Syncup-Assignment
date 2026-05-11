import { z } from "zod";

export const createJobSchema = z.object({
  body: z.object({
    title: z.string().min(2),
    description: z.string().min(10),
    requirements: z.string().optional(),
    companyName: z.string().min(2),
    location: z.string().min(2),
    employmentType: z.string().min(2),
    salaryMin: z.number().int().positive().optional(),
    salaryMax: z.number().int().positive().optional(),
    isRemote: z.boolean().optional(),
  }),
});

export const updateJobSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z
    .object({
      title: z.string().min(2).optional(),
      description: z.string().min(10).optional(),
      requirements: z.string().optional(),
      companyName: z.string().min(2).optional(),
      location: z.string().min(2).optional(),
      employmentType: z.string().min(2).optional(),
      salaryMin: z.number().int().positive().optional(),
      salaryMax: z.number().int().positive().optional(),
      isRemote: z.boolean().optional(),
      isActive: z.boolean().optional(),
    })
    .refine((value) => Object.keys(value).length > 0, {
      message: "At least one field is required",
    }),
});

export const jobIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});
